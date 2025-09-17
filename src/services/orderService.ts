import prisma from "../config/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { CCTransactionSchema, OrderSchema } from "../validations/orderValidations";
import { format } from "date-fns";
import { DurationType, Gender } from "@prisma/client";
import { calculateAge } from "../utils/calculateAge";
import { isStartBeforeEnd } from "../utils/isStartBeforeEnd";
import axios from "axios";
import { newPlanMapping, newPolicyCode, newProductCode } from "../utils/policyHelpers";

dayjs.extend(utc);
dayjs.extend(timezone);

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
        where: { id: product.product_category_id }
      })
      if (!productCategory) {
        throw new Error("Product category not found");
      }

      // Fetch city based on customer city id
      const city = await tx.city.findUnique({
        where: { id: data.customer_city }
      })
      if (!city) {
        throw new Error("City not found")
      }

      if (product.product_type === "travel") { // if product type is travel then check travel details
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
      } else if (product.product_type === "home") { // if product type is home then check homecare details
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
      } else if (product.product_type === "purchase_protection") { // if product type is purchase protection then check purchase protection details
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
          parent_id: data.parent_id,
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
          parent_id: data.parent_id,
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
          takaful_policy: data.takaful_policy ?? false,
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
      } else if (product.product_type === "purchase_protection" && data.purchase_protection) {
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
            duration_type: data.purchase_protection.duration_type as DurationType,
            created_by: createdBy
          }
        })
      }

      let code = "";
      if (product.product_type === "health") {
        let planId = "000";
        let prefix = "91";
        planId = newPlanMapping(product.product_name, plan.name);
        const policyCode = newPolicyCode(policy.id);
        code = `${prefix}${planId}${policyCode}`;
      } else {
        const branchCode = data.takaful_policy ? branch.his_code_takaful : branch.his_code;
        const productCode = newProductCode(Number(productCategory?.product_code || 0));
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
          const courier = await getCourier(data.takaful_policy ?? false);
          if (!courier) {
            console.warn("Courier not found, will allow repush later");
          } else {
            const token = Buffer.from(`${process.env.BLUEEX_USERNAME}:${process.env.BLUEEX_PASSWORD}`).toString("base64");
            let datatoSend = {
              shipper_name: "Jubilee General Insurance",
              shipper_email: "support@jubileegeneral.com.pk",
              shipper_contact: "021-111-654-321",
              shipper_address: "Jubilee General Insurance Co Ltd, 2nd Floor, Jubilee Insurance House, I. I. Chundrigar Road Karachi",
              shipper_city: "KHI",
              customer_name: data.shipping_name,
              customer_email: data.shipping_email,
              customer_contact: data.shipping_phone,
              customer_address: data.shipping_address,
              customer_city: city ? city.city_code : "KHI",
              customer_country: "PK",
              customer_comment: "https://jubileegeneral.com.pk/policydoc?policy_no=910570059256-R6",
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
            status: "verified"
          }
        })
        if (order?.status === "verified" && product.product_type === "health") {
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

export const ccTransaction = async (data: CCTransactionSchema) => {
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
        cc_approval_code: data.approval_code
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
            include: { productCategory: true },
          },
        },
      }),
    ]);

    if (!policy) {
      throw new Error("Policy not found");
    }

    let code: string;
    if (policy.product.product_type === "health") {
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
            status:
              policy.product.product_type === "health"
                ? "pendingCBO"
                : "pendingIGIS",
          },
        }),
      ]);
      return { policy_code: code };
    }

    return { policy_code: null };
  });

  return result;
};

export const orderByOrderCode = async (order_code: string, transaction?: any) => {
  if (transaction) {
    return await transaction.order.findUnique({ where: { order_code } });
  } else {
    return await prisma.order.findUnique({ where: { order_code } });
  }
};

export const getPaymentMode = async (payment_mode_id: number) => {
  const paymentMode = await prisma.paymentMode.findUnique({
    where: { id: payment_mode_id },
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
      is_takaful: is_takaful
    }
  })
}
