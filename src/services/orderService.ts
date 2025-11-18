import prisma from "../config/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  CCTransactionSchema,
  GenerateHISSchema,
  ListSchema,
  OrderCodeSchema,
  OrderPolicyStatusSchema,
  OrderSchema,
} from "../validations/orderValidations";
import { format } from "date-fns";
import { DurationType, Gender } from "@prisma/client";
import { calculateAge } from "../utils/calculateAge";
import { isStartBeforeEnd } from "../utils/isStartBeforeEnd";
import axios from "axios";
import {
  courierBookingForRepush,
  coverageStatusUpdate,
  newPlanMapping,
  newPolicyCode,
  newProductCode,
} from "../utils/policyHelpers";
import { Request } from "express";
import { getPolicyWording } from "../utils/getPolicyWordings";
import { sendEmail } from "../utils/sendEmail";
import { getOrderB2BTemplate } from "../utils/getOrderB2BTemplate";
import { sendSms } from "../utils/sendSms";
import { sendWhatsAppMessage } from "../utils/sendWhatsappSms";
import {
  createZipFile,
  pad,
  sanitize,
  writeHISTextFile,
} from "../utils/fileUtils";
import { BulkOrder } from "../validations/bulkOrderValidations";
import { skuDetails } from "./orderService2";
import { AuthRequest } from "../types/types";
import { sendVerificationNotifications } from "../utils/utils";
import path from "path";
import fs from "fs";

dayjs.extend(utc);
dayjs.extend(timezone);

const Constants = {
  DEFAULT_HIS_CODE: process.env.DEFAULT_HIS_CODE,
  DEFAULT_FBL_HIS_CODE: process.env.DEFAULT_FBL_HIS_CODE,
  DEFAULT_HIS_CODE_TAKAFULL: process.env.DEFAULT_HIS_CODE_TAKAFULL,
  DEFAULT_FBL_HIS_CODE_TAKAFULL: process.env.DEFAULT_FBL_HIS_CODE_TAKAFULL,
  BRANCH_CODE: process.env.BRANCH_CODE,
  BRANCH_CODE_TAKAFUL: process.env.BRANCH_CODE_TAKAFUL,
};

export const bulkOrder = async (
  data: BulkOrder,
  createdBy: number,
  req: AuthRequest
) => {
  const successResults: any[] = [];
  const failedResults: any[] = [];

  const CHUNK_SIZE = 10;

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);

    const chunkPromises = chunk.map(async (order) => {
      try {
        const orderExists = await orderByOrderCode(order.order_code);
        if (orderExists) {
          return {
            order_code: order.order_code,
            status: "failed" as const,
            message: "Order code already exists",
          };
        }

        const [mapper, paymentMode] = await Promise.all([
          skuDetails(order.child_sku),
          getPaymentModeByCode(order.payment_mode_code),
        ]);

        if (!mapper) {
          return {
            order_code: order.order_code,
            status: "failed" as const,
            message: "Child SKU does not exist",
          };
        }

        if (!paymentMode) {
          return {
            order_code: order.order_code,
            status: "failed" as const,
            message: "Payment mode not found",
          };
        }

        const txResult = await prisma.$transaction(
          async (tx) => {
            const duplicate = await tx.order.findUnique({
              where: { order_code: order.order_code },
            });

            if (duplicate) {
              throw new Error("Duplicate order code inside transaction");
            }

            const product = await tx.product.findUnique({
              where: { id: mapper.product_id },
              include: { productCategory: true },
            });

            if (!product) {
              throw new Error("Product not found");
            }
            if (!product.productCategory) {
              throw new Error("Product category not found");
            }

            const lastOrder = (await tx.$queryRawUnsafe(`
            SELECT 
                pol.policy_code,
                pol.issue_date,
                pol.start_date,
                ord.renewal_number
            FROM \`Order\` ord
            LEFT JOIN Policy pol ON ord.id = pol.order_id
            WHERE
                pol.status IS NOT NULL
                AND ord.customer_cnic = '${order.customer_cnic}'
                AND pol.product_id = ${mapper.product_id}
                AND pol.status IN ( 'IGISposted', 'HISposted' )
            ORDER BY ord.id DESC
            LIMIT 1
          `)) as {
              policy_code?: string;
              issue_date?: string;
              start_date?: string;
              renewal_number?: string;
            }[];

            // create order
            const newOrder = await tx.order.create({
              data: {
                order_code: order.order_code,
                create_date: dayjs(new Date()).format("YYYY-MM-DD"),
                customer_name: order.customer_name ?? null,
                customer_cnic: order.customer_cnic,
                customer_dob: order.customer_dob ?? null,
                customer_email: order.customer_email ?? null,
                customer_contact: order.customer_contact ?? null,
                customer_address: order.customer_address ?? null,
                customer_occupation: order.customer_occupation ?? null,
                payment_method_id: paymentMode.id,
                payment: order.received_premium,
                received_premium: order.received_premium,
                created_by: createdBy,
              },
              include: {
                apiUser: true,
              },
            });

            // create policy
            const policy = await tx.policy.create({
              data: {
                order_id: newOrder.id,
                plan_id: mapper.plan_id,
                product_id: mapper.product_id,
                product_option_id: mapper.option_id,
                issue_date: order.issue_date ?? null,
                start_date: order.start_date ?? null,
                expiry_date: order.expiry_date ?? null,
                item_price: mapper.product_option?.price?.toString() ?? "0",
                sum_insured: mapper.product_option?.price?.toString() ?? "0",
                received_premium: order.received_premium,
                type: product.product_type,
                created_by: createdBy,
                takaful_policy: product.is_takaful == true ? true : false,
              },
            });

            // create policy details if provided
            if (order.policy_detail && order.policy_detail.length > 0) {
              const policyDetails = order.policy_detail.map((c) => ({
                policy_id: policy.id,
                name: c.name ?? null,
                dob: c.dob ?? null,
                cnic: c.cnic ?? null,
                gender: (c.gender as Gender) ?? null,
                age: c.dob ? calculateAge(c.dob) : null,
                relation: c.relation ?? null,
                cnic_issue_date: c.cnic_issue_date ?? null,
                type: c.type ?? null,
                created_by: createdBy,
              }));
              await tx.policyDetail.createMany({ data: policyDetails });
            }

            // create riders if provided
            if (order.rider && order.rider.length > 0) {
              const policyRiders = order.rider.map((r) => ({
                policy_id: policy.id,
                rider_name: r.name,
                sum_insured: r.sum_insured,
                created_by: createdBy,
              }));
              await tx.fblPolicyRider.createMany({ data: policyRiders });
            }

            // Generate and set policy code
            let code = "";
            if (
              newOrder.apiUser?.name.toLowerCase() === "mmbl" &&
              order.policy_no
            ) {
              code = order.policy_no;
            } else {
              const planName = mapper.plan.name ?? "";
              const planId = newPlanMapping(product.product_name, planName);
              code = `91${planId}${newPolicyCode(policy.id)}`;
            }

            const policyDocumentUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/orders/${newOrder.order_code}/pdf`;

            await tx.order.update({
              where: { id: newOrder.id },
              data: { status: "verified" },
            });

            const updatedPolicy = await tx.policy.update({
              where: { id: policy.id },
              data: {
                qr_doc_url: policyDocumentUrl,
                policy_code: code,
                status: "pendingCBO",
              },
            });

            // return stable identifiers to the outer scope
            return {
              orderId: newOrder.id,
              policyId: policy.id,
              lastOrder,
              mapper: mapper,
              order: newOrder,
              policy: updatedPolicy,
              product,
            };
          },
          {
            timeout: 30000, // 30 seconds
          }
        ); // end transaction

        // set renewal number and pec coverage
        const apiUser = txResult.order.apiUser;
        if (apiUser?.name.toLowerCase() == "coverage") {
          const split = txResult.order.order_code.split("-");
          const renewalNumber = split[split.length - 1];

          if (renewalNumber.includes("R")) {
            const pec_coverage =
              Number(renewalNumber.split("R")[1]) > 3 ? 100 : 0;
            await prisma.order.update({
              where: { id: txResult.orderId },
              data: {
                renewal_number: renewalNumber,
                pec_coverage: pec_coverage.toString(),
              },
            });
          } else {
            await prisma.order.update({
              where: { id: txResult.orderId },
              data: { renewal_number: "R0", pec_coverage: "0" },
            });
          }
        } else {
          const lastOrder = txResult.lastOrder;
          if (lastOrder.length > 0) {
            const dayDiff =
              lastOrder[0].start_date && txResult.policy.start_date
                ? Math.abs(
                    (new Date(txResult.policy.start_date).getTime() -
                      new Date(lastOrder[0].start_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0;
            if (dayDiff <= 405) {
              const updatedRenewalNumber =
                Number(lastOrder[0]?.renewal_number?.split("R")[1]) + 1;
              let pec_coverage = 0;

              if (apiUser?.name.toLowerCase().includes("faysalbank")) {
                if (
                  txResult.product.product_name
                    .toLowerCase()
                    .includes("personal") ||
                  txResult.product.product_name.toLowerCase() ===
                    "fbl-takaful health cover"
                ) {
                  if (updatedRenewalNumber > 2) pec_coverage = 100;
                } else if (
                  txResult.product.product_name.toLowerCase().includes("family")
                ) {
                  if (updatedRenewalNumber === 0) pec_coverage = 20;
                  else if (updatedRenewalNumber === 1) pec_coverage = 50;
                  else if (updatedRenewalNumber > 1) pec_coverage = 100;
                }
              } else if (apiUser?.name.toLowerCase().includes("mib")) {
                pec_coverage =
                  updatedRenewalNumber === 0
                    ? 10
                    : updatedRenewalNumber === 1
                    ? 20
                    : updatedRenewalNumber === 2
                    ? 30
                    : 50;
              } else if (apiUser?.name.toLowerCase().includes("hmb")) {
                pec_coverage =
                  updatedRenewalNumber === 0
                    ? 20
                    : updatedRenewalNumber === 1
                    ? 30
                    : 50;
              } else if (updatedRenewalNumber > 2) {
                pec_coverage = 100;
              }

              await prisma.order.update({
                where: { id: txResult.orderId },
                data: {
                  renewal_number: `R${updatedRenewalNumber}`,
                  pec_coverage: pec_coverage.toString(),
                },
              });
            } else {
              await prisma.order.update({
                where: { id: txResult.orderId },
                data: {
                  renewal_number: "R0",
                  pec_coverage: "0",
                },
              });
            }
          } else {
            await prisma.order.update({
              where: { id: txResult.orderId },
              data: {
                renewal_number: "R0",
                pec_coverage: "0",
              },
            });
          }
        }

        // Email & Sms
        let Insurance: string,
          insurance: string,
          doc: string,
          buisness: string,
          url: string,
          jubilee: string,
          takaful: boolean,
          smsString: string,
          logo: string,
          customerName: string,
          orderId: string,
          createdDate: string;

        customerName = txResult.order.customer_name;
        orderId = txResult.order.order_code;
        createdDate = txResult.order.create_date;

        const policyWording = getPolicyWording(
          apiUser?.name.toLowerCase(),
          txResult.product.product_name,
          txResult.policy.takaful_policy,
          false
        );
        const policyWordingUrl = `${process.env.BASE_URL}/uploads/policy-wordings/${policyWording.wordingFile}`;
        const extraDocs = policyWording.extraUrls.map((url) => ({
          filename: url,
          path: `${process.env.BASE_URL}/uploads/policy-wordings/${url}`,
          contentType: "application/pdf",
        }));

        if (txResult.mapper.child_sku.toLowerCase().includes("takaful")) {
          url = process.env.POLICY_VERIFICATION_TAKAFUL as string;
          const logoPath = path.join(
            process.cwd(),
            "uploads",
            "logo",
            "takaful_logo.png"
          );
          const logoBase64 = fs
            .readFileSync(logoPath)
            .toString("base64")
            .replace(/\r?\n|\r/g, "");
          logo = `data:image/png;base64,${logoBase64}`;
          Insurance = "Takaful";
          insurance = "";
          doc = "PMD(s)";
          buisness = "Takaful Retail Business Division";
          jubilee = "Jubilee General Takaful";
          takaful = true;
          smsString = `Dear ${txResult.order.customer_name}, Thank you for choosing Jubilee General ${txResult.product.product_name} .Your PMD # is ${txResult.policy.policy_code}. Click here to view your PMD: ${txResult.policy.qr_doc_url}. For more information please dial our toll free # 0800 03786`;
        } else {
          url = process.env.POLICY_VERIFICATION_INSURANCE as string;
          const logoPath = path.join(
            process.cwd(),
            "uploads",
            "logo",
            "insurance_logo.png"
          );
          const logoBase64 = fs
            .readFileSync(logoPath)
            .toString("base64")
            .replace(/\r?\n|\r/g, "");
          logo = `data:image/png;base64,${logoBase64}`;
          Insurance = "Insurance";
          insurance = "insurance";
          doc = "policy document(s)";
          if (
            apiUser != null &&
            apiUser.name.toLowerCase().includes("hblbanca")
          ) {
            buisness = "Bancassurance Department";
          } else {
            buisness = "Retail Business Division";
          }
          jubilee = "Jubilee General Insurance";
          takaful = false;
          smsString = `Dear ${txResult.order.customer_name}, Thank you for choosing Jubilee General ${txResult.product.product_name}. Your Policy # is ${txResult.policy.policy_code}. Click here to view your Policy: ${txResult.policy.qr_doc_url}. For more information please dial our toll free # 0800 03786`;
        }

        await sendEmail({
          to: txResult.order.customer_email || "",
          subject: "Policy Order Successful",
          html: getOrderB2BTemplate(
            logo,
            customerName,
            Insurance,
            insurance,
            doc,
            orderId,
            createdDate,
            buisness,
            url,
            jubilee,
            takaful,
            txResult.product.product_name,
            txResult.order.received_premium
          ),
          attachments: [
            {
              filename: `${txResult.policy.policy_code}.pdf`,
              path: txResult.policy.qr_doc_url || "",
              contentType: "application/pdf",
            },
            {
              filename: policyWording.wordingFile,
              path: policyWordingUrl,
              contentType: "application/pdf",
            },
            ...extraDocs,
          ],
        });

        if (
          !txResult.product.product_name
            .toLowerCase()
            .includes("parents-care-plus")
        ) {
          await sendSms(txResult.order.customer_contact || "", smsString);
        } else {
          if (txResult.policy.takaful_policy) {
            await sendWhatsAppMessage({
              policyType: "takaful_digital",
              phoneNumber: txResult.order.customer_contact || "",
              params: [
                txResult.order.customer_name,
                txResult.mapper.plan.name,
                txResult.policy.policy_code || "",
                txResult.policy.qr_doc_url || "",
              ],
            });
          } else {
            await sendWhatsAppMessage({
              policyType: "conventional_digital",
              phoneNumber: txResult.order.customer_contact || "",
              params: [
                txResult.order.customer_name,
                txResult.mapper.plan.name,
                txResult.policy.policy_code || "",
                txResult.policy.qr_doc_url || "",
              ],
            });
          }
        }

        // transaction success
        return {
          order_code: order.order_code,
          status: "success" as const,
          message: "Created",
          orderId: txResult.orderId,
          policyId: txResult.policyId,
        };
      } catch (err: any) {
        // Convert thrown errors into failed result with meaningful message
        const message =
          err?.message && typeof err?.message === "string"
            ? err.message
            : "Unexpected error during order processing";

        return {
          order_code: order.order_code,
          status: "failed" as const,
          message,
        };
      }
    }); // end map

    const chunkResults = await Promise.all(chunkPromises);

    for (const r of chunkResults) {
      if (r.status === "success") successResults.push(r);
      else failedResults.push(r);
    }
  } // end for chunks

  return {
    total: data.length,
    success: successResults.length,
    failed: failedResults.length,
    successResults,
    failedResults,
  };
};

export const createOrder = async (data: OrderSchema, createdBy: number) => {
  const create_date = format(new Date(), "yyyy-MM-dd");

  const orderTrx = await prisma.$transaction(
    async (tx) => {
      // Check if order code already exists
      const orderExists = await orderByOrderCode(data.order_code, tx);
      if (orderExists) {
        throw new Error("Order code already exists");
      }

      // Check if parent and child sku exists
      const mapper = await parentAndChildSkuExists(
        data.product_details.parent_sku,
        data.product_details.sku
      );
      if (!mapper) {
        throw new Error("Parent and child sku does not exist");
      }

      const plan = (await tx.plan.findUnique({
        where: { id: mapper.plan_id },
      })) || { name: "" };

      const branch = await tx.branch.findFirst({
        where: data.branch_id ? { id: data.branch_id } : { name: "Direct" },
        select: {
          his_code: true,
          his_code_takaful: true,
        },
      });

      if (!branch) {
        throw new Error("Branch not found");
      }

      // Check if payment mode is COD then shipping details are required
      const paymentMode = await getPaymentMode(data.payment_method_id);
      if (!paymentMode) {
        throw new Error("Payment mode not found");
      }

      if (paymentMode.payment_code === "COD") {
        if (
          !data.shipping_name ||
          !data.shipping_address ||
          !data.shipping_phone ||
          !data.shipping_email
        ) {
          throw new Error("Shipping details are required");
        }
      }

      // Check if product exists
      const product = await tx.product.findUnique({
        where: {
          id: mapper.product_id,
        },
      });
      if (!product) {
        throw new Error("Product not found");
      }

      // Check if product category exists
      const productCategory = await tx.productCategory.findUnique({
        where: { id: product.product_category_id },
      });
      if (!productCategory) {
        throw new Error("Product category not found");
      }

      // Fetch city based on customer city id
      const city = await tx.city.findUnique({
        where: { id: data.customer_city },
      });
      if (!city) {
        throw new Error("City not found");
      }

      if (product.product_type === "travel") {
        // if product type is travel then check travel details
        if (
          data.travel_details &&
          (!data.travel_details.travel_from ||
            !data.travel_details.no_of_days ||
            !data.travel_details.destination ||
            !data.travel_details.tution_fee ||
            !data.travel_details.travel_end_date ||
            !data.travel_details.travel_start_date)
        ) {
          throw new Error("Travel details are required");
        }

        if (
          data.travel_details &&
          !isStartBeforeEnd(
            data.travel_details.travel_start_date,
            data.travel_details.travel_end_date
          )
        ) {
          throw new Error("Travel start date must be before travel end date");
        }
      } else if (product.product_type === "home") {
        // if product type is home then check homecare details
        if (!data.homecare_details || data.homecare_details.length === 0) {
          throw new Error("Homecare details are required for home product.");
        }
        const invalidHomecare = data.homecare_details.some((c) => {
          const missingFields =
            !c.ownership_status ||
            !c.structure_type ||
            !c.plot_area ||
            !c.address ||
            !c.city;

          return missingFields;
        });
        if (invalidHomecare) {
          throw new Error(
            "Each homecare detail record must contain ownership_status, structure_type, plot_area, address, and city."
          );
        }
      } else if (product.product_type === "purchase_protection") {
        // if product type is purchase protection then check purchase protection details
        if (
          data.purchase_protection &&
          (!data.purchase_protection.name ||
            !data.purchase_protection.duration ||
            !data.purchase_protection.duration_type ||
            !data.purchase_protection.total_price)
        ) {
          throw new Error("Purchase protection details are required");
        }
      }

      const newOrder = await tx.order.create({
        data: {
          order_code: data.order_code,
          create_date,
          parent_id: String(data.parent_id),
          customer_name: data.customer_name,
          customer_cnic: data.customer_cnic,
          customer_dob: data.customer_dob,
          customer_email: data.customer_email,
          customer_contact: data.customer_contact,
          customer_address: data.customer_address,
          customer_city: city.city_code,
          customer_occupation: data.customer_occupation,
          payment_method_id: data.payment_method_id,
          payment: data.received_premium,
          coupon_id: data.coupon_id,
          discount_amount: data.discount_amount,
          received_premium: data.received_premium,
          branch_id: data.branch_id,
          branch_name: data.branch_name,
          agent_id: data.agent_id,
          agent_name: data.agent_name,
          client_id: data.client_id,
          development_office_id: data.development_office_id,
          shipping_method: data.shipping_method,
          shipping_charges: data.shipping_charges,
          shipping_name: data.shipping_name,
          shipping_address: data.shipping_address,
          shipping_email: data.shipping_email,
          shipping_phone: data.shipping_phone,
          tracking_number: data.tracking_number,
          courier_status: data.courier_status,
          delivery_date: data.delivery_date,
          refunded: data.refunded,
          staff_comments: data.staff_comments,
          cc_transaction_id: data.cc_transaction_id,
          cc_approval_code: data.cc_approval_code,
          jazzcash_date_time: data.jazzcash_date_time,
          channel: data.channel,
          idev: data.idev,
          referred_by: data.referred_by,
          kiosk_pin: data.kiosk_pin,
          kiosk_last_digit: data.kiosk_last_digit,
          test_book: data.test_book,
          api_user_id: data.api_user_id,
          created_by: createdBy,
        },
      });

      const policy = await tx.policy.create({
        data: {
          order_id: newOrder.id,
          parent_id: String(data.parent_id),
          plan_id: mapper.plan_id,
          product_id: mapper.product_id,
          product_option_id: mapper.option_id,
          api_user_id: data.api_user_id,
          issue_date: data.issue_date,
          start_date: data.start_date,
          expiry_date: data.expiry_date,
          item_price: data.product_details.item_price,
          received_premium: data.received_premium,
          discount_amount: data.discount_amount,
          sum_insured: data.product_details.sum_insured,
          type: product.product_type,
          product_type: data.product_details.product_type,
          takaful_policy: product.is_takaful == true ? true : false,
          is_renewed: data.is_renewed ?? false,
          refunded: data.refunded,
          quantity: data.quantity ?? 1,
          created_by: createdBy,
        },
      });

      const customerDetails = data.customer_details.map((customer) => {
        return {
          policy_id: policy.id,
          name: customer.insurance_name,
          dob: customer.insurance_dob,
          cnic: customer.insurance_cnic,
          occupation: data.customer_occupation,
          address: data.customer_address,
          contact_number: customer.insurance_mobile,
          email: customer.insurance_email,
          city: city.city_code,
          gender: customer.insurance_gender as Gender,
          age: customer.insurance_dob
            ? calculateAge(customer.insurance_dob)
            : null,
          relation: customer.insurance_relationship,
          passport_no: customer.insurance_passport_no,
          poc: customer.insurance_poc,
          nicop: customer.insurance_nicop,
          cnic_issue_date: customer.insurance_cnic_issue_date,
          type: customer.type,
          created_by: createdBy,
        };
      });

      await tx.policyDetail.createMany({
        data: customerDetails,
        skipDuplicates: true,
      });

      if (product.product_type === "travel" && data.travel_details) {
        await tx.policyTravel.create({
          data: {
            policy_id: policy.id,
            travel_from: data.travel_details.travel_from,
            no_of_days: data.travel_details.no_of_days,
            destination: data.travel_details.destination,
            tution_fee: data.travel_details.tution_fee,
            travel_end_date: data.travel_details.travel_end_date,
            travel_start_date: data.travel_details.travel_start_date,
            sponsor: data.travel_details.sponsor,
            sponsor_address: data.travel_details.sponsor_address,
            sponsor_contact: data.travel_details.sponsor_contact,
            institute: data.travel_details.institute,
            travelling_dates: `${data.travel_details.travel_start_date} to ${data.travel_details.travel_end_date}`,
            program: data.travel_details.program,
            offer_letter_ref_no: data.travel_details.offer_letter_ref_no,
            travel_purpose: data.travel_details.travel_purpose,
            type: data.travel_details.type,
            program_duration: data.travel_details.program_duration,
            travel_type: data.travel_details.travel_type,
            created_by: createdBy,
          },
        });
      } else if (product.product_type === "home" && data.homecare_details) {
        const homecareDetails = data.homecare_details.map((record) => {
          return {
            policy_id: policy.id,
            ownership_status: record.ownership_status,
            structure_type: record.structure_type,
            plot_area: record.plot_area,
            address: record.address,
            city: record.city,
            building: record.building,
            rent: record.rent,
            content: record.content,
            jewelry: record.jewelry,
            created_by: createdBy,
          };
        });

        await tx.policyHomecare.createMany({
          data: homecareDetails,
          skipDuplicates: true,
        });
      } else if (
        product.product_type === "purchase_protection" &&
        data.purchase_protection
      ) {
        await tx.policyPurchaseProtection.create({
          data: {
            policy_id: policy.id,
            name: data.purchase_protection.name,
            imei: data.purchase_protection.imei,
            serial_number: data.purchase_protection.serial_number,
            retailer_sku: data.purchase_protection.retailer_sku,
            quantity: data.quantity ?? 1,
            sum_insured: data.product_details.sum_insured,
            total_price: data.purchase_protection.total_price,
            item_price: data.product_details.item_price,
            received_premium: data.received_premium,
            duration: data.purchase_protection.duration,
            duration_type: data.purchase_protection
              .duration_type as DurationType,
            created_by: createdBy,
          },
        });
      }

      let code = "";
      if (product.is_cbo) {
        let planId = "000";
        let prefix = "91";
        planId = newPlanMapping(product.product_name, plan.name);
        const policyCode = newPolicyCode(policy.id);
        code = `${prefix}${planId}${policyCode}`;
      } else {
        const branchCode = product.is_takaful
          ? branch.his_code_takaful
          : branch.his_code;
        const productCode = newProductCode(
          Number(productCategory?.product_code || 0)
        );
        const policyCode = newPolicyCode(policy.id);
        code = `${branchCode}-${productCode}-${policyCode}`;
      }

      await tx.order.update({
        where: { id: newOrder.id },
        data: { status: "unverified" },
      });

      if (paymentMode.payment_code === "COD") {
        await tx.policy.update({
          where: { id: policy.id },
          data: { policy_code: code },
        });
        try {
          const courier = await getCourier(product.is_takaful ? true : false);
          if (!courier) {
            console.warn("Courier not found, will allow repush later");
          } else {
            const token = Buffer.from(
              `${process.env.BLUEEX_USERNAME}:${process.env.BLUEEX_PASSWORD}`
            ).toString("base64");
            let datatoSend = {
              shipper_name: "Jubilee General Insurance",
              shipper_email: "support@jubileegeneral.com.pk",
              shipper_contact: "021-111-654-321",
              shipper_address:
                "Jubilee General Insurance Co Ltd, 2nd Floor, Jubilee Insurance House, I. I. Chundrigar Road Karachi",
              shipper_city: "KHI",
              customer_name: data.shipping_name,
              customer_email: data.shipping_email,
              customer_contact: data.shipping_phone,
              customer_address: data.shipping_address,
              customer_city: city ? city.city_code : "KHI",
              customer_country: "PK",
              customer_comment:
                "https://jubileegeneral.com.pk/policydoc?policy_no=910570059256-R6",
              shipping_charges: "100",
              payment_type: "COD",
              service_code: "BE",
              total_order_amount: data.received_premium.toString(),
              total_order_weight: "1",
              order_refernce_code: "",
              fragile: "N",
              parcel_type: "N",
              insurance_require: "N",
              insurance_value: "0",
              testbit: "Y",
              cn_generate: "Y",
              multi_pickup: "N",
              products_detail: [
                {
                  product_code: code,
                  product_name: data.product_details.item_name,
                  product_price: data.received_premium.toString(),
                  product_weight: "1",
                  product_quantity: "1",
                  product_variations: "document",
                  sku_code: data.product_details.sku,
                },
              ],
            };

            let config = {
              method: "post",
              maxBodyLength: Infinity,
              url: courier.book_url,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${token}`,
              },
              data: datatoSend,
            };

            const response = await axios.request(config);

            if (response.data && response.data.status === "1") {
              await tx.order.update({
                where: { id: newOrder.id },
                data: {
                  tracking_number: response.data.cnno,
                  status: "pendingCOD",
                },
              });

              await tx.policy.update({
                where: { id: policy.id },
                data: {
                  status: "pendingCOD",
                },
              });
            } else {
              console.error("BlueEx booking failed:", response.data);
            }
          }
        } catch (err: any) {
          console.error("BlueEx error:", err.response?.data || err.message);
        }
      } else if (paymentMode.payment_code === "B2B") {
        await tx.policy.update({
          where: { id: policy.id },
          data: { policy_code: code },
        });
        const order = await tx.order.update({
          where: { id: newOrder.id },
          data: {
            status: "verified",
          },
        });
        if (order?.status === "verified" && product.is_cbo) {
          await tx.policy.update({
            where: { id: policy.id },
            data: { status: "pendingCBO" },
          });
        } else if (order?.status === "verified") {
          await tx.policy.update({
            where: { id: policy.id },
            data: { status: "pendingIGIS" },
          });
        }
      }

      return { policy_code: code };
    },
    {
      timeout: 30000,
    }
  );
  return orderTrx;
};

export const ccTransaction = async (
  data: CCTransactionSchema,
  req: Request
) => {
  const order = await orderByOrderCode(data.order_code);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "verified") {
    throw new Error("Order is already verified");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        cc_transaction_id: data.transaction_id,
        cc_approval_code: data.approval_code,
      },
    });

    const [branch, policy] = await Promise.all([
      updatedOrder.branch_id
        ? tx.branch.findUnique({
            where: { id: updatedOrder.branch_id },
            select: { his_code: true, his_code_takaful: true },
          })
        : tx.branch.findFirst({
            where: { name: "Direct" },
            select: { his_code: true, his_code_takaful: true },
          }),
      tx.policy.findFirst({
        where: { order_id: updatedOrder.id },
        include: {
          plan: { select: { name: true } },
          product: {
            include: {
              productCategory: true,
              webappMappers: {
                select: {
                  plan: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!policy) {
      throw new Error("Policy not found");
    }

    let code: string;
    if (policy.product.is_cbo) {
      const planId = newPlanMapping(
        policy.product.product_name,
        policy.plan?.name || ""
      );
      code = `91${planId}${newPolicyCode(policy.id)}`;
    } else {
      const branchCode = policy.takaful_policy
        ? branch?.his_code_takaful
        : branch?.his_code;
      const productCode = newProductCode(
        Number(policy.product.productCategory?.product_code || 0)
      );
      code = `${branchCode}-${productCode}-${newPolicyCode(policy.id)}`;
    }

    if (data.reason_code === "100") {
      await Promise.all([
        tx.order.update({
          where: { id: updatedOrder.id },
          data: { status: "verified" },
        }),
        tx.policy.update({
          where: { id: policy.id },
          data: {
            policy_code: code,
            status: policy.product.is_cbo ? "pendingCBO" : "pendingIGIS",
          },
        }),
      ]);

      const apiUser = order.apiUser;
      const isCoverage = apiUser?.name.toLowerCase() == "coverage";

      if (isCoverage) {
        const coverageStatusResponse = await coverageStatusUpdate(
          order.order_code,
          policy.policy_code || "",
          policy.product.is_cbo ? "pendingCBO" : "pendingIGIS",
          "",
          "verified"
        );

        if (coverageStatusResponse.success) {
          await prisma.policy.update({
            where: { id: policy.id },
            data: {
              qr_doc_url: `https://dev-coverage.jubileegeneral.com.pk/policydoc?policy_no=${policy.policy_code}`,
            },
          });

          return;
        } else {
          console.log("Failed:", coverageStatusResponse.error);
        }
      }

      // Email Start / End
      const policyDocumentUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/orders/${order.order_code}/pdf`;

      let logo: string = `${req.protocol}://${req.hostname}/uploads/logo/insurance_logo.png`;
      let customerName: string = order.customer_name;
      let orderId: string = order.order_code;
      let createdDate: string = order.create_date;
      let Insurance: string;
      let insurance: string;
      let doc: string;
      let buisness: string;
      let url: string;
      let jubilee: string;
      let takaful: boolean;
      let smsString: string;

      const policyWording = getPolicyWording(
        apiUser?.name.toLowerCase(),
        policy.product.product_name,
        policy.takaful_policy,
        false
      );
      const policyWordingUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}/uploads/policy-wordings/${policyWording.wordingFile}`;
      const extraDocs = policyWording.extraUrls.map((url) => ({
        filename: url,
        path: `${req.protocol}://${req.hostname}:${process.env.PORT}/uploads/policy-wordings/${url}`,
        contentType: "application/pdf",
      }));

      if (policy.takaful_policy) {
        url = "https://jubileegeneral.com.pk/gettakaful/policy-verification";
        logo = `${req.protocol}://${req.hostname}:${process.env.PORT}/uploads/logo/takaful_logo.jpg`;
        Insurance = "Takaful";
        insurance = "";
        doc = "PMD(s)";
        buisness = "Takaful Retail Business Division";
        jubilee = "Jubilee General Takaful";
        takaful = true;
        smsString = `Dear ${order.customer_name}, Thank you for choosing Jubilee General ${policy.product.product_name} .Your PMD # is ${policy.policy_code}. Click here to view your PMD: ${policyDocumentUrl}. For more information please dial our toll free # 0800 03786`;
      } else {
        url = "https://jubileegeneral.com.pk/getinsurance/policy-verification";
        logo = `${req.protocol}://${req.hostname}:${process.env.PORT}/uploads/logo/insurance_logo.jpg`;
        Insurance = "Insurance";
        insurance = "insurance";
        doc = "policy document(s)";
        if (
          apiUser != null &&
          apiUser.name.toLowerCase().includes("hblbanca")
        ) {
          buisness = "Bancassurance Department";
        } else {
          buisness = "Retail Business Division";
        }
        jubilee = "Jubilee General Insurance";
        takaful = false;
        smsString = `Dear ${order.customer_name}, Thank you for choosing Jubilee General ${policy.product.product_name}. Your Policy # is ${policy.policy_code}. Click here to view your Policy: ${policyDocumentUrl}. For more information please dial our toll free # 0800 03786`;
      }

      await sendEmail({
        to: order.customer_email,
        subject: "Policy Order Successful",
        html: getOrderB2BTemplate(
          logo,
          customerName,
          Insurance,
          insurance,
          doc,
          orderId,
          createdDate,
          buisness,
          url,
          jubilee,
          takaful,
          policy.product.product_name,
          order.received_premium
        ),
        attachments: [
          {
            filename: `${policy.policy_code}.pdf`,
            path: policyDocumentUrl,
            contentType: "application/pdf",
          },
          {
            filename: policyWording.wordingFile,
            path: policyWordingUrl,
            contentType: "application/pdf",
          },
          ...extraDocs,
        ],
      });

      if (
        !policy.product.product_name.toLowerCase().includes("parents-care-plus")
      ) {
        await sendSms(order.customer_contact, smsString);
      } else {
        if (policy.takaful_policy) {
          await sendWhatsAppMessage({
            policyType: "takaful_digital",
            phoneNumber: order.customer_contact,
            params: [
              order.customer_name,
              policy.plan.name,
              policy.policy_code,
              policyDocumentUrl,
            ],
          });
        } else {
          await sendWhatsAppMessage({
            policyType: "conventional_digital",
            phoneNumber: order.customer_contact,
            params: [
              order.customer_name,
              policy.plan.name,
              policy.policy_code,
              policyDocumentUrl,
            ],
          });
        }

        return { policy_code: code };
      }

      return { policy_code: null };
    }
  });

  return result;
};

export const manuallyVerifyCC = async (
  data: CCTransactionSchema,
  req: Request
) => {
  const order = await orderByOrderCode(data.order_code);
  if (!order) throw new Error("Order not found");
  if (order.status === "verified") throw new Error("Order is already verified");

  const result = await prisma.$transaction(
    async (tx) => {
      const [branch, policy] = await Promise.all([
        order.branch_id
          ? tx.branch.findUnique({
              where: { id: order.branch_id },
              select: { his_code: true, his_code_takaful: true },
            })
          : tx.branch.findFirst({
              where: { name: "Direct" },
              select: { his_code: true, his_code_takaful: true },
            }),
        tx.policy.findFirst({
          where: { order_id: order.id },
          include: {
            plan: { select: { name: true } },
            product: {
              include: {
                productCategory: true,
                webappMappers: {
                  select: {
                    plan: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      if (!policy) {
        throw new Error("Policy not found");
      }

      const policyCode = generatePolicyCode(policy, branch);

      const [updatedOrder, updatedPolicy] = await Promise.all([
        tx.order.update({
          where: { id: order.id },
          data: {
            status: "verified",
            cc_transaction_id: data.transaction_id,
            cc_approval_code: data.approval_code,
          },
          include: { apiUser: true },
        }),
        tx.policy.update({
          where: { id: policy.id },
          data: {
            policy_code: policyCode,
            status: policy.product.is_cbo ? "pendingCBO" : "pendingIGIS",
          },
          include: {
            plan: { select: { name: true } },
            product: {
              include: {
                productCategory: true,
                webappMappers: {
                  select: {
                    plan: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      return { policy: updatedPolicy, order: updatedOrder };
    },
    {
      timeout: 15000,
    }
  );

  try {
    await sendVerificationNotifications(result.policy, result.order, req);
  } catch (notifyErr) {
    console.error("Notification error:", notifyErr);
  }

  return { policy_code: result.policy.policy_code };
};

export const orderPolicyStatus = async (data: OrderPolicyStatusSchema) => {
  const { status, agent_id, branch_id, client_id, policy_id } = data;

  if (status === "IGISposted" && (!agent_id || !branch_id || !client_id)) {
    throw new Error("Agent, Branch, and Client are required");
  }

  const updatedPolicy = await prisma.$transaction(async (tx) => {
    const policy = await tx.policy.findUnique({
      where: { id: policy_id },
      include: { order: true },
    });

    if (!policy) throw new Error("Policy not found");

    const orderUpdateData: any = {
      agent_id,
      branch_id,
      client_id,
    };

    if (status === "cancelled") {
      orderUpdateData.status = "cancelled";
    }

    const updated = await tx.policy.update({
      where: { id: policy_id },
      data: {
        status,
        order: {
          update: orderUpdateData,
        },
      },
    });

    return updated;
  });

  return updatedPolicy;
};

export const orderList = async (data: ListSchema) => {
  let query = "";
  const filters: string[] = [];

  switch (data.mode) {
    case "orders":
      query = `
          SELECT
	          ord.id AS 'id',
            p.id AS 'policy_id',
	          ord.order_code AS 'order_code',
	          ord.create_date AS 'create_date',
	          ord.received_premium AS 'premium',
	          ord.customer_name AS 'customer_name',
	          ord.customer_contact AS 'customer_contact',
	          ord.branch_name AS 'branch_name',
	          ord.tracking_number AS 'cnno',
	          pm.name AS 'payment_mode',
	          au.name AS 'api_user_name',
	          ord.status AS 'order_status',
            pm.payment_code,
            p.takaful_policy
          FROM
	          \`Order\` ord
	        LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
          LEFT JOIN Policy p ON ord.id = p.order_id
	        LEFT JOIN ApiUser au ON ord.api_user_id = au.id
          WHERE ord.is_active = 1 AND ord.is_deleted = 0`;
      break;
    case "policies":
      query = `
            SELECT
	            ord.id AS 'id',
              p.id AS 'policy_id',
	            ord.order_code AS 'order_code',
	            p.policy_code AS 'policy_number',
	            ord.create_date AS 'create_date',
	            p.issue_date AS 'issue_date',
	            p.expiry_date AS 'expiry_date',
	            ord.received_premium AS 'premium',
	            ord.customer_name AS 'customer_name',
	            ord.customer_contact AS 'customer_contact',
	            ord.branch_name AS 'branch_name',
	            prod.product_name AS 'product',
	            ord.tracking_number AS 'cnno',
	            pm.name AS 'payment_mode',
	            au.name AS 'api_user_name',
	            ord.status AS 'order_status',
	            p.status AS 'policy_status',
              pm.payment_code,
              p.takaful_policy
            FROM
	            \`Order\` ord
	          LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
	          LEFT JOIN ApiUser au ON ord.api_user_id = au.id
	          LEFT JOIN Policy p ON ord.id = p.order_id
	          LEFT JOIN Product prod ON p.product_id = prod.id
            WHERE ord.is_active = 1 AND ord.is_deleted = 0`;
      break;
    case "cbo":
      query = `
          SELECT
            ord.order_code AS 'order_code',
            ord.id AS 'id',
            p.id AS 'policy_id',
            ord.create_date AS 'create_date',
            p.policy_code AS 'policy_number',
            p.issue_date AS 'issue_date',
            p.expiry_date AS 'expiry_date',
            ord.received_premium AS 'premium',
            ord.customer_name AS 'customer_name',
            ord.customer_contact AS 'customer_contact',
            (SELECT pd.cnic FROM PolicyDetail pd WHERE pd.policy_id = p.id AND LOWER(pd.type) = 'customer' LIMIT 1 ) AS 'customer_cnic',
            ord.branch_name AS 'branch_name',
            prod.product_name AS 'product',
            prod.id AS 'product_id',
            (SELECT COUNT(*) FROM PolicyDetail pd WHERE pd.policy_id = p.id ) AS 'no_of_persons_covered',
            ord.tracking_number AS 'cnno',
            pm.name AS 'payment_mode',
            au.name AS 'api_user_name',
            ord.renewal_number AS 'policy_category',
            ord.pec_coverage AS 'pec_coverage',
            ord.renewal_number AS 'renewal_number',
            ord.status AS 'order_status',
            p.status AS 'policy_status',
            pm.payment_code,
            p.takaful_policy
          FROM
            \`Order\` ord
          LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
          LEFT JOIN ApiUser au ON ord.api_user_id = au.id
          LEFT JOIN Policy p ON ord.id = p.order_id
          LEFT JOIN Product prod ON p.product_id = prod.id
          WHERE ord.is_active = 1 AND ord.is_deleted = 0 AND p.policy_code IS NOT NULL`;
      break;
    case "renewal":
      query = `
            SELECT
	            ord.id AS 'id',
              p.id AS 'policy_id',
	            ord.order_code AS 'order_code',
	            p.policy_code AS 'policy_number',
	            ord.create_date AS 'create_date',
	            p.issue_date AS 'issue_date',
	            p.expiry_date AS 'expiry_date',
	            ord.received_premium AS 'premium',
	            ord.customer_name AS 'customer_name',
	            ord.customer_contact AS 'customer_contact',
	            ord.branch_name AS 'branch_name',
	            prod.product_name AS 'product',
	            ord.tracking_number AS 'cnno',
	            pm.name AS 'payment_mode',
	            au.name AS 'api_user_name',
	            ord.status AS 'order_status',
	            p.status AS 'policy_status',
              pm.payment_code,
              p.takaful_policy
            FROM
	            \`Order\` ord
	          LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
	          LEFT JOIN ApiUser au ON ord.api_user_id = au.id
	          LEFT JOIN Policy p ON ord.id = p.order_id
	          LEFT JOIN Product prod ON p.product_id = prod.id 
            WHERE
	            ord.is_active = 1 
	            AND ord.is_deleted = 0 
	            AND p.status NOT IN ( 'pending', 'pendingIGIS', 'pendingCOD', 'pendingCBO' )
              AND prod.is_cbo = 1`;
      break;
    default:
      query = `
          SELECT
	          ord.id AS 'id',
            p.id AS 'policy_id',
	          ord.order_code AS 'order_code',
	          ord.create_date AS 'create_date',
	          ord.received_premium AS 'premium',
	          ord.customer_name AS 'customer_name',
	          ord.customer_contact AS 'customer_contact',
	          ord.branch_name AS 'branch_name',
	          ord.tracking_number AS 'cnno',
	          pm.name AS 'payment_mode',
	          au.name AS 'api_user_name',
	          ord.status AS 'order_status',
            pm.payment_code,
            p.takaful_policy
          FROM
	          \`Order\` ord
	        LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
          LEFT JOIN Policy p ON ord.id = p.order_id
	        LEFT JOIN ApiUser au ON ord.api_user_id = au.id
          WHERE ord.is_active = 1 AND ord.is_deleted = 0`;
  }

  // ---- Apply Filters ----
  if (data.api_user_id && data.api_user_id.length > 0) {
    const ids = data.api_user_id.join(", ");
    filters.push(`ord.api_user_id IN (${ids})`);
  }

  if (data.order_status && data.order_status.length > 0) {
    const statuses = data.order_status
      .map((m) => `'${m.toLowerCase()}'`)
      .join(", ");
    filters.push(`ord.status IN (${statuses})`);
  }

  if (data.policy_status && data.policy_status.length > 0) {
    const statuses = data.policy_status
      .map((m) => `'${m.toLowerCase()}'`)
      .join(", ");
    filters.push(`p.status IN (${statuses})`);
  }

  if (data.month && data.month.length > 0) {
    const months = data.month.map((m) => `'${m.toLowerCase()}'`).join(", ");
    filters.push(`LOWER(MONTHNAME(p.expiry_date)) IN (${months})`);
  }

  if (data.date && (!data.cnic || !data.contact)) {
    if(data.mode === "renewal"){
      const [start, end] = data.date.split(" to ");
      filters.push(`DATE(p.expiry_date) BETWEEN '${start}' AND '${end}'`);
    }else{
      const [start, end] = data.date.split(" to ");
      filters.push(`DATE(ord.create_date) BETWEEN '${start}' AND '${end}'`);
    }
  }

  if (data.product_id && data.product_id.length > 0) {
    const ids = data.product_id.join(", ");
    filters.push(`p.product_id IN (${ids})`);
  }

  if (data.branch_id && data.branch_id.length > 0) {
    const ids = data.branch_id.join(", ");
    filters.push(`ord.branch_id IN (${ids})`);
  }

  if (data.payment_mode_id && data.payment_mode_id.length > 0) {
    const ids = data.payment_mode_id.join(", ");
    filters.push(`ord.payment_method_id IN (${ids})`);
  }

  if (data.cnic) {
    filters.push(`ord.customer_cnic = '${data.cnic}'`);
  }

  if (data.contact) {
    filters.push(`ord.customer_contact = '${data.contact}'`);
  }

  if (filters.length > 0) {
    query += " AND " + filters.join(" AND ");
  }

  query += ` ORDER BY ord.id DESC`;
  
  const result = await prisma.$queryRawUnsafe<any[]>(query);

  const serialized = result.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === "bigint" ? value.toString() : value,
      ])
    )
  );

  return serialized;
};

export const singleOrder = async (data: OrderCodeSchema) => {
  const order = await prisma.order.findUnique({
    where: { order_code: data.order_code },
    include: {
      payemntMethod: true,
      coupon: true,
      branch: true,
      agent: true,
      client: true,
      developmentOfficer: true,
      apiUser: true,
      Policy: {
        include: {
          plan: true,
          product: {
            include: {
              productCategory: true,
            },
          },
          productOption: true,
          policyDetails: true,
          PolicyTravel: true,
          PolicyHomecare: true,
          PolicyPurchaseProtection: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

export const repushOrder = async (data: OrderCodeSchema) => {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { order_code: data.order_code },
      include: {
        Policy: {
          include: {
            product: {
              include: {
                productCategory: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "unverified") {
      throw new Error("Only unverified orders can be repushed");
    }

    const policy = order.Policy?.[0];
    if (!policy) {
      throw new Error("Policy not found for order");
    }

    const { product } = policy;

    const branch = order.branch_id
      ? await tx.branch.findUnique({
          where: { id: order.branch_id },
          select: { his_code: true, his_code_takaful: true },
        })
      : await tx.branch.findFirst({
          where: { name: "Direct" },
          select: { his_code: true, his_code_takaful: true },
        });

    if (!branch) {
      throw new Error("Branch not found");
    }

    const city = await tx.city.findFirst({
      where: { city_name: order.customer_city || "" },
    });

    // ⚡ Regenerate policy code to ensure it’s fresh
    let code = "";
    if (product.is_cbo) {
      const plan = await tx.plan.findUnique({
        where: { id: policy.plan_id },
      });
      const planId = newPlanMapping(product.product_name, plan?.name || "");
      const prefix = "91";
      code = `${prefix}${planId}${newPolicyCode(policy.id)}`;
    } else {
      const branchCode = policy.takaful_policy
        ? branch.his_code_takaful
        : branch.his_code;
      const productCode = newProductCode(
        Number(product.productCategory?.product_code || 0)
      );
      code = `${branchCode}-${productCode}-${newPolicyCode(policy.id)}`;
    }

    await tx.policy.update({
      where: { id: policy.id },
      data: { policy_code: code },
    });

    try {
      await courierBookingForRepush(
        order.id,
        policy.id,
        code,
        {
          shipping_name: order.shipping_name ?? undefined,
          shipping_email: order.shipping_email ?? undefined,
          shipping_phone: order.shipping_phone ?? undefined,
          shipping_address: order.shipping_address ?? undefined,
          customer_city_id: city?.id ?? undefined,
          takaful_policy: policy.takaful_policy ?? undefined,
          received_premium: Number(order.received_premium),
          product_name: product.product_name,
          sku: product.product_name || "",
        },
        tx
      );
    } catch (err) {
      console.error("Courier booking failed:", err);
      throw new Error("Courier booking failed"); // rollback everything
    }

    return { policy_code: code };
  });
};

export const orderByOrderCode = async (
  order_code: string,
  transaction?: any
) => {
  if (transaction) {
    return await transaction.order.findUnique({
      where: { order_code },
      include: { apiUser: true },
    });
  } else {
    return await prisma.order.findUnique({
      where: { order_code },
      include: { apiUser: true },
    });
  }
};

export const getPaymentMode = async (payment_mode_id: number) => {
  const paymentMode = await prisma.paymentMode.findUnique({
    where: { id: payment_mode_id },
  });
  return paymentMode;
};

export const getPaymentModeByCode = async (payment_mode_code: string) => {
  const paymentMode = await prisma.paymentMode.findFirst({
    where: { payment_code: payment_mode_code },
  });
  return paymentMode;
};

export const parentAndChildSkuExists = async (
  parent_sku: string,
  child_sku: string
) => {
  const mapper = await prisma.webappMapper.findFirst({
    where: {
      parent_sku,
      child_sku,
    },
  });
  return mapper;
};

export const getCourier = async (is_takaful: boolean) => {
  return await prisma.courier.findFirst({
    where: {
      is_takaful: is_takaful,
    },
  });
};

export const generateHIS = async (data: GenerateHISSchema) => {
  const whereClause: any = {
    status: "HISposted",
    is_deleted: false,
  };

  // Optional date filter
  if (data.date) {
    const [start, end] = data.date.split("to").map((d) => d.trim());
    whereClause.issue_date = {
      gte: start,
      lte: end,
    };
  }

  const policies = await prisma.policy.findMany({
    where: whereClause,
    include: {
      order: {
        include: {
          branch: true,
          apiUser: true,
          coupon: true,
        },
      },
      policyDetails: true,
      product: true,
      plan: true,
    },
  });

  const relationMapper = await prisma.relationMapping.findMany({
    select: {
      id: true,
      name: true,
      gender: true,
      short_key: true,
    },
  });

  const hisRetailLines: string[] = [];
  const hisDependantLines: string[] = [];

  for (const policy of policies) {
    const { order, product, plan } = policy;
    const customer = policy.policyDetails.find(
      (item) => item.type.toLowerCase() == "customer"
    );

    const parentMother = policy.policyDetails.find(
      (item) =>
        item.type.toLowerCase().includes("parent") &&
        item?.relation?.toLowerCase().includes("mother")
    );

    const parentFather = policy.policyDetails.find(
      (item) =>
        item.type.toLowerCase().includes("parent") &&
        item?.relation?.toLowerCase().includes("father")
    );

    const childDataArray = policy.policyDetails.filter(
      (item) => !item.type.toLowerCase().includes("customer")
    );

    const apiUser = order.apiUser;
    let ProductName = product.product_name;

    if (ProductName.includes("CriticalCare")) {
      ProductName = "CriticalCare";
    } else if (ProductName.includes("Personal")) {
      ProductName = "Personal Health Care";
    } else if (ProductName.includes("Family")) {
      ProductName = "Family Health Care";
    }

    const branch = order.branch;

    let his_code = Constants.DEFAULT_HIS_CODE;
    if (apiUser != null && apiUser.name.includes("faysalbank")) {
      his_code = Constants.DEFAULT_FBL_HIS_CODE;
    }
    if (policy.takaful_policy) {
      if (apiUser != null && apiUser.name.includes("faysalbank")) {
        his_code = Constants.DEFAULT_FBL_HIS_CODE_TAKAFULL;
      } else {
        his_code = Constants.DEFAULT_HIS_CODE_TAKAFULL;
      }
    }

    if (branch != null) {
      if (policy.takaful_policy) his_code = branch.his_code_takaful;
      else his_code = branch.his_code;
    }

    let discount = parseFloat(policy.discount_amount);
    let province = "-";
    let city = order.customer_city == null ? "-" : order.customer_city;
    let postalCode = "-";
    let fax = "-";
    let netPremium: string | number = +policy.received_premium;

    let netPremiumNonFiler = netPremium;
    if (policy.filer_tax_status === false) {
      netPremiumNonFiler -= Number(policy.filer_tax_per_item);
    }
    let grossPremium: number | string = Math.round(
      (netPremiumNonFiler - 20) / (0.01 + 1)
    );
    let fedralInsuranceFee: number | string = Math.round(grossPremium * 0.01);

    netPremium = sanitize(policy.received_premium);
    grossPremium = sanitize(grossPremium.toString());
    fedralInsuranceFee = sanitize(fedralInsuranceFee.toString());

    let line: string[] = [];
    let dependentline: string[] = [];
    if (customer != undefined) {
      let hisCode = sanitize(his_code);
      let policyCode = sanitize(policy.policy_code);
      let customerName = sanitize(customer.name);
      let DOB = customer.dob
        ? sanitize(dayjs(customer.dob).format("YYYY-MM-DD"))
        : "";
      let address = sanitize(customer.address);
      let CNIC = sanitize(customer.cnic);
      let contact = sanitize(customer.contact_number);
      let gender = sanitize(
        customer.gender ? customer.gender.charAt(0).toUpperCase() : ""
      );
      let passport = sanitize(customer.passport_no);
      const status = policy.status == "cancelled" ? "Cancelled" : "Verified";
      let email = sanitize(customer.email);
      let occupation = sanitize(customer.occupation);
      let issue_date = sanitize(policy.issue_date);
      let start_date = sanitize(policy.start_date);
      let expiry_date = sanitize(policy.expiry_date);
      let planName = sanitize(plan.name);
      let sumInsured = sanitize(Math.round(+policy.sum_insured).toString());
      let filer_tax_per_item = sanitize(
        Math.round(+policy.filer_tax_per_item) == 0
          ? ""
          : Math.round(+policy.filer_tax_per_item).toString()
      );
      let renewalNumber = sanitize(order.renewal_number ?? "N");
      let pecCoverage = sanitize(order.pec_coverage ?? "0");

      if (parentMother != null && parentMother != undefined) {
        customerName = sanitize(parentMother.name ?? "");
        DOB = parentMother.dob
          ? dayjs(parentMother.dob).format("YYYY-MM-DD")
          : "";
        address = sanitize(parentMother.address ?? "");
        CNIC = sanitize(parentMother.cnic ?? "");
        contact = sanitize(parentMother.contact_number ?? "");
      }

      if (parentFather != null && parentFather != undefined) {
        customerName = sanitize(parentFather.name ?? "");
        DOB = parentFather.dob
          ? dayjs(parentFather.dob).format("YYYY-MM-DD")
          : "";
        address = sanitize(parentFather.address ?? "");
        CNIC = sanitize(parentFather.cnic ?? "");
        contact = sanitize(parentFather.contact_number ?? "");
      }

      if (customer.relation?.toLowerCase() == "self") {
        DOB = customer.dob ? dayjs(customer.dob).format("YYYY-MM-DD") : "";
      }

      line.push(hisCode);
      line.push(policyCode);
      line.push(customerName);
      line.push(gender);
      line.push(address);
      line.push(DOB);
      line.push(CNIC);
      line.push(passport);
      line.push(contact);
      line.push(email);
      line.push(occupation);
      line.push(issue_date);
      line.push(start_date);
      line.push(expiry_date);
      line.push(ProductName);
      line.push(planName);
      line.push(sumInsured);
      line.push(grossPremium);
      line.push(status);
      line.push(province);
      line.push(city);
      line.push(postalCode);
      line.push(fax);

      if (policy.filer_tax_status === false) {
        line.push(sanitize("4"));
        line.push(filer_tax_per_item);
      } else {
        line.push("");
        line.push("");
      }

      line.push(sanitize("20"));
      line.push(fedralInsuranceFee);
      line.push(netPremium);
      line.push("-");
      line.push("-");
      line.push("-");
      line.push("-");
      line.push(renewalNumber);
      line.push(pecCoverage);

      hisRetailLines.push(line.join("\t"));
    }

    if (childDataArray.length > 0) {
      childDataArray.forEach((item) => {
        let dependentline: string[] = [];

        const relation = relationMapper.find(
          (mapper) =>
            mapper.gender == item.gender &&
            mapper.name
              ?.toLowerCase()
              .includes(item.relation ? item.relation.toLowerCase() : "")
        );

        let packageId = "087";
        dependentline.push(sanitize(his_code));
        dependentline.push(sanitize(policy.policy_code));
        dependentline.push(packageId);
        dependentline.push(sanitize(item.name));
        dependentline.push(
          sanitize(item.dob ? dayjs(item.dob).format("DD/MM/YYYY") : "")
        );

        if (relation && relation.short_key) {
          dependentline.push(relation.short_key.toUpperCase());
        } else {
          dependentline.push(
            item.relation ? item.relation.toUpperCase().charAt(0) : ""
          );
        }

        dependentline.push("-");
        hisDependantLines.push(dependentline.join("\t"));
      });
    }
  }

  const retailPathDependent = await writeHISTextFile(
    "his_retail_dependent.txt",
    hisDependantLines
  );
  const retailPath = await writeHISTextFile("his_retail.txt", hisRetailLines);

  // ✅ Create a ZIP file containing both
  const zipFileName = `his_files_${Date.now()}.zip`;
  const zipPath = await createZipFile(
    [
      { path: retailPath, name: "his_retail.txt" },
      { path: retailPathDependent, name: "his_retail_dependent.txt" },
    ],
    zipFileName
  );
  const splittedPath = zipPath.split("uploads");
  return splittedPath[1];
};

export const generatePolicyCode = (policy: any, branch: any): string => {
  if (policy.product.is_cbo) {
    const planId = newPlanMapping(
      policy.product.product_name,
      policy.plan?.name || ""
    );
    return `91${planId}${newPolicyCode(policy.id)}`;
  }
  const branchCode = policy.takaful_policy
    ? branch?.his_code_takaful
    : branch?.his_code;
  const productCode = newProductCode(
    Number(policy.product.productCategory?.product_code || 0)
  );
  return `${branchCode}-${productCode}-${newPolicyCode(policy.id)}`;
};

// const orderQuery = `
//   SELECT
// 	  ord.id AS 'id',
// 	  ord.order_code AS 'order_code',
// 	  ord.create_date AS 'create_date',
// 	  ord.received_premium AS 'premium',
// 	  ord.customer_name AS 'customer_name',
// 	  ord.customer_contact AS 'customer_contact',
// 	  ord.branch_name AS 'branch_name',
// 	  ord.tracking_number AS 'cnno',
// 	  pm.name AS 'payment_mode',
// 	  au.name AS 'api_user_name',
// 	  ord.status
//   FROM
// 	\`Order\` ord
// 	LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
// 	LEFT JOIN ApiUser au ON ord.api_user_id = au.id
//   WHERE ord.is_active = 1 AND ord.is_deleted = 0`;

//   const policyQuery = `
//   SELECT
// 	  ord.id AS 'id',
// 	  ord.order_code AS 'order_code',
// 	  p.policy_code AS 'policy_number',
// 	  ord.create_date AS 'create_date',
// 	  p.issue_date AS 'issue_date',
// 	  p.expiry_date AS 'expiry_date',
// 	  ord.received_premium AS 'premium',
// 	  ord.customer_name AS 'customer_name',
// 	  ord.customer_contact AS 'customer_contact',
// 	  ord.branch_name AS 'branch_name',
// 	  prod.product_name AS 'product',
// 	  ord.tracking_number AS 'cnno',
// 	  pm.name AS 'payment_mode',
// 	  au.name AS 'api_user_name',
// 	  ord.status AS 'order_status',
// 	  p.status AS 'policy_status'
//   FROM
// 	  \`Order\` ord
// 	LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
// 	LEFT JOIN ApiUser au ON ord.api_user_id = au.id
// 	LEFT JOIN Policy p ON ord.id = p.order_id
// 	LEFT JOIN Product prod ON p.product_id = prod.id
//   WHERE ord.is_active = 1 AND ord.is_deleted = 0`;

//   const cboQuery = `
//   SELECT
// 	  ord.id AS 'id',
// 	  ord.order_code AS 'order_code',
// 	  p.policy_code AS 'policy_number',
// 	  ord.create_date AS 'create_date',
// 	  p.issue_date AS 'issue_date',
// 	  p.expiry_date AS 'expiry_date',
// 	  ord.received_premium AS 'premium',
// 	  ord.customer_name AS 'customer_name',
// 	  ord.customer_contact AS 'customer_contact',
// 	  ord.branch_name AS 'branch_name',
// 	  prod.product_name AS 'product',
// 	  (SELECT COUNT(*) FROM PolicyDetail pd WHERE pd.policy_id = p.id ) AS 'no_of_persons_covered',
// 	  ord.tracking_number AS 'cnno',
// 	  pm.name AS 'payment_mode',
// 	  au.name AS 'api_user_name',
// 	  '---' AS 'policy_category',
// 	  '---' AS 'pec_coverage',
// 	  '---' AS 'renewal_coverage',
// 	  ord.status AS 'order_status',
// 	  p.status AS 'policy_status'
//   FROM
// 	  \`Order\` ord
// 	LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
// 	LEFT JOIN ApiUser au ON ord.api_user_id = au.id
// 	LEFT JOIN Policy p ON ord.id = p.order_id
// 	LEFT JOIN Product prod ON p.product_id = prod.id
//   WHERE ord.is_active = 1 AND ord.is_deleted = 0`;

//   const renewalQuery = `
//   SELECT
// 	  ord.id AS 'id',
// 	  ord.order_code AS 'order_code',
// 	  p.policy_code AS 'policy_number',
// 	  ord.create_date AS 'create_date',
// 	  p.issue_date AS 'issue_date',
// 	  p.expiry_date AS 'expiry_date',
// 	  ord.received_premium AS 'premium',
// 	  ord.customer_name AS 'customer_name',
// 	  ord.customer_contact AS 'customer_contact',
// 	  ord.branch_name AS 'branch_name',
// 	  prod.product_name AS 'product',
// 	  ord.tracking_number AS 'cnno',
// 	  pm.name AS 'payment_mode',
// 	  au.name AS 'api_user_name',
// 	  ord.status AS 'order_status',
// 	  p.status AS 'policy_status'
//   FROM
// 	  \`Order\` ord
// 	LEFT JOIN PaymentMode pm ON ord.payment_method_id = pm.id
// 	LEFT JOIN ApiUser au ON ord.api_user_id = au.id
// 	LEFT JOIN Policy p ON ord.id = p.order_id
// 	LEFT JOIN Product prod ON p.product_id = prod.id
//   WHERE
// 	  ord.is_active = 1
// 	  AND ord.is_deleted = 0
// 	  AND MONTHNAME( p.expiry_date ) = 'September'
// 	  AND p.status NOT IN ( 'pending', 'pendingIGIS', 'pendingCOD', 'pendingCBO' )`
