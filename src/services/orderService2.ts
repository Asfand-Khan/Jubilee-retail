import prisma from "../config/db";
import { OrderSchema } from "../validations/orderValidations";
import { format } from "date-fns";
import { DurationType, Gender } from "@prisma/client";
import { calculateAge } from "../utils/calculateAge";
import { isStartBeforeEnd } from "../utils/isStartBeforeEnd";
import { courierBooking, newPlanMapping, newPolicyCode, newProductCode } from "../utils/policyHelpers";

export const createOrder = async (data: OrderSchema, createdBy: number) => {
    const create_date = format(new Date(), "yyyy-MM-dd");

    const result = await prisma.$transaction(
        async (tx) => {
            // Run independent lookups in parallel
            const [orderExists, mapper, branch, paymentMode, city] =
                await Promise.all([
                    orderByOrderCode(data.order_code, tx),
                    parentAndChildSkuExists(
                        data.product_details.parent_sku,
                        data.product_details.sku
                    ),
                    data.branch_id
                        ? tx.branch.findUnique({
                            where: { id: data.branch_id },
                            select: { his_code: true, his_code_takaful: true },
                        })
                        : tx.branch.findFirst({
                            where: { name: "Direct" },
                            select: { his_code: true, his_code_takaful: true },
                        }),
                    getPaymentMode(data.payment_method_id),
                    tx.city.findUnique({ where: { id: data.customer_city } }),
                ]);

            if (orderExists) throw new Error("Order code already exists");
            if (!mapper) throw new Error("Parent and child sku does not exist");
            if (!branch) throw new Error("Branch not found");
            if (!paymentMode) throw new Error("Payment mode not found");
            if (!city) throw new Error("City not found");

            // COD → shipping details required
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

            // product + category in one query
            const product = await tx.product.findUnique({
                where: { id: mapper.product_id },
                include: { productCategory: true },
            });
            if (!product) throw new Error("Product not found");
            if (!product.productCategory)
                throw new Error("Product category not found");


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

            // Create order
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

            // Create policy
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

            // Policy details
            if (data.customer_details?.length) {
                const customerDetails = data.customer_details.map((c) => ({
                    policy_id: policy.id,
                    name: c.insurance_name,
                    dob: c.insurance_dob,
                    cnic: c.insurance_cnic,
                    occupation: data.customer_occupation,
                    address: data.customer_address,
                    contact_number: c.insurance_mobile,
                    email: c.insurance_email,
                    city: city.city_code,
                    gender: c.insurance_gender as Gender,
                    age: c.insurance_dob ? calculateAge(c.insurance_dob) : null,
                    relation: c.insurance_relationship,
                    passport_no: c.insurance_passport_no,
                    poc: c.insurance_poc,
                    nicop: c.insurance_nicop,
                    cnic_issue_date: c.insurance_cnic_issue_date,
                    type: c.type,
                    created_by: createdBy,
                }));
                await tx.policyDetail.createMany({ data: customerDetails });
            }

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

            // Generate policy code
            let code = "";
            if (product.product_type === "health") {
                const planId = newPlanMapping(product.product_name, (await tx.plan.findUnique({ where: { id: mapper.plan_id } }))?.name || "");
                const prefix = "91";
                code = `${prefix}${planId}${newPolicyCode(policy.id)}`;
            } else {
                const branchCode = data.takaful_policy
                    ? branch.his_code_takaful
                    : branch.his_code;
                const productCode = newProductCode(
                    Number(product.productCategory?.product_code || 0)
                );
                code = `${branchCode}-${productCode}-${newPolicyCode(policy.id)}`;
            }


            // Update order + policy basic fields
            await tx.order.update({
                where: { id: newOrder.id },
                data: { status: "unverified" },
            });

            return {
                code,
                orderId: newOrder.id,
                policyId: policy.id,
                paymentMode: paymentMode.payment_code,
                productType: product.product_type,
            };
        },
        {
            timeout: 30000,
        }
    );

    if (result.paymentMode === "COD") {
        await prisma.policy.update({
            where: { id: result.policyId },
            data: {
                policy_code: result.code,
            },
        });
        courierBooking(result.orderId, result.policyId, result.code, data).catch(
            (err) => console.error("Courier booking failed:", err)
        );
    } else if (result.paymentMode === "B2B") {
        await prisma.order.update({
            where: { id: result.orderId },
            data: { status: "verified" },
        });
        await prisma.policy.update({
            where: { id: result.policyId },
            data: {
                policy_code: result.code,
                status: result.productType === "health" ? "pendingCBO" : "pendingIGIS",
            },
        });
    }

    return { policy_code: result.code };
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