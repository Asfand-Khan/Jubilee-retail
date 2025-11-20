import { OrderSchema } from "../validations/orderValidations";
import prisma from "../config/db";
import { getCourier } from "../services/orderService2";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { Request } from "express";
import { getPolicyWording } from "./getPolicyWordings";
import { sendEmail } from "./sendEmail";
import { getOrderCODTemplate } from "./getOrderB2BTemplate";
import { sendSms } from "./sendSms";
import { sendWhatsAppMessage } from "./sendWhatsappSms";
import { encodeOrderCode } from "./base64Url";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function newPlanMapping(prod: string, plan: string): string {
  let planId = "000";

  if (prod.includes("SEHAT SARMAYA (Maternity)")) {
    planId = "122";
  } else if (prod.includes("SEHAT SARMAYA")) {
    planId = "121";
  } else if (
    prod.includes("Female Centric Health Takaful") &&
    prod.includes("FBL")
  ) {
    if (plan.includes("Plan A")) {
      planId = "102";
    } else if (plan.includes("Plan B")) {
      planId = "103";
    }
  } else if (prod.includes("Personal Accident") && prod.includes("FBL")) {
    if (plan.includes("Gold")) {
      planId = "099";
    } else if (plan.includes("Silver")) {
      planId = "100";
    } else if (plan.includes("Bronze")) {
      planId = "101";
    }
  } else if (
    !prod.includes("Parent Care Plus") &&
    !prod.includes("Parents Care Plus") &&
    !prod.includes("Parent-Care-Plus") &&
    !prod.includes("Parents-Care-Plus")
  ) {
    if (prod.includes("Personal")) {
      if (prod.includes("FBL")) {
        if (plan.includes("Gold")) {
          planId = "064";
        } else if (plan.includes("Silver")) {
          planId = "065";
        } else if (plan.includes("Bronze")) {
          planId = "066";
        }
      } else if (prod.includes("MIB")) {
        if (plan.includes("Gold")) {
          planId = "082";
        } else if (plan.includes("Silver")) {
          planId = "083";
        } else if (plan.includes("Bronze")) {
          planId = "084";
        }
      } else if (plan.includes("Gold")) {
        planId = "051";
      } else if (plan.includes("Silver")) {
        planId = "052";
      } else if (plan.includes("Bronze")) {
        planId = "053";
      } else if (plan.includes("Diamond")) {
        planId = "091";
      } else if (plan.includes("Platinum")) {
        planId = "092";
      }
    } else if (prod.includes("Critical")) {
      if (plan.includes("Silver")) {
        planId = "060";
      } else if (plan.includes("Gold")) {
        planId = "061";
      } else if (plan.includes("Diamond")) {
        planId = "085";
      } else if (plan.includes("Platinum")) {
        planId = "086";
      }
    } else if (prod.includes("MIB") && prod.includes("Family")) {
      if (plan.includes("Gold - Family A")) {
        planId = "076";
      } else if (plan.includes("Gold - Family B")) {
        planId = "077";
      } else if (plan.includes("Gold - Family C")) {
        planId = "078";
      } else if (plan.includes("Silver - Family A")) {
        planId = "079";
      } else if (plan.includes("Silver - Family B")) {
        planId = "080";
      } else if (plan.includes("Silver - Family C")) {
        planId = "081";
      }
    } else if (prod.includes("HBLBanca") && prod.includes("Hospital")) {
      if (plan.includes("PlanA")) {
        planId = "102";
      } else if (plan.includes("PlanB")) {
        planId = "103";
      } else if (plan.includes("PlanC")) {
        planId = "104";
      }
    } else if (prod.includes("SHIFA")) {
      if (plan.includes("Gold")) {
        planId = "105";
      } else if (plan.includes("Silver")) {
        planId = "106";
      }
    } else if (prod.includes("SCB") && prod.includes("Family")) {
      if (plan.includes("SCB Platinum")) {
        planId = "107";
      } else if (plan.includes("SCB Gold")) {
        planId = "108";
      } else if (plan.includes("SCB Silver")) {
        planId = "109";
      }
    } else if (prod.includes("SEHAT PLAN")) {
      if (plan.includes("HMB Bronze")) {
        planId = "112";
      } else if (plan.includes("HMB Silver")) {
        planId = "111";
      } else if (plan.includes("HMB Gold")) {
        planId = "110";
      }
    } else if (prod.includes("Family")) {
      if (prod.includes("FBL")) {
        if (plan.includes("Gold")) {
          planId = "099";
        } else if (plan.includes("Silver")) {
          planId = "100";
        } else if (plan.includes("Bronze")) {
          planId = "101";
        }
      }

      if (plan.includes("Gold - Family A")) {
        planId = "057";
      } else if (plan.includes("Gold - Family B")) {
        planId = "058";
      } else if (plan.includes("Gold - Family C")) {
        planId = "059";
      } else if (plan.includes("Silver - Family A")) {
        planId = "054";
      } else if (plan.includes("Silver - Family B")) {
        planId = "055";
      } else if (plan.includes("Silver - Family C")) {
        planId = "056";
      } else if (plan.includes("Diamond - Family A")) {
        planId = "093";
      } else if (plan.includes("Diamond - Family B")) {
        planId = "094";
      } else if (plan.includes("Diamond - Family C")) {
        planId = "095";
      } else if (plan.includes("Platinum - Family A")) {
        planId = "096";
      } else if (plan.includes("Platinum - Family B")) {
        planId = "097";
      } else if (plan.includes("Platinum - Family C")) {
        planId = "098";
      }
    } else if (prod.includes("Parent")) {
      if (plan.includes("Platinum")) {
        planId = "068";
      } else if (plan.includes("Silver")) {
        planId = "067";
      } else if (plan.includes("Titanium")) {
        planId = "087";
        if (plan.includes("Plus")) {
          planId = "088";
        }
      } else if (plan.toLowerCase().includes("gold")) {
        planId = "062";
      }
    } else if (prod.includes("Her")) {
      if (plan.includes("Diamond")) {
        planId = "089";
      } else if (plan.includes("Platinum")) {
        planId = "090";
      } else {
        planId = "063";
      }
    }
  } else if (plan.includes("Platinum Takaful")) {
    planId = "118";
  } else if (plan.includes("Gold Takaful")) {
    planId = "117";
  } else if (plan.includes("Silver Takaful")) {
    planId = "116";
  } else if (plan.includes("Platinum")) {
    planId = "115";
  } else if (plan.includes("Gold")) {
    planId = "114";
  } else if (plan.includes("Silver")) {
    planId = "113";
  }

  return planId;
}

export function newPolicyCode(polId: number): string {
  const policyId = polId.toString();
  const padLength = 7 - policyId.length;

  // Equivalent to Java's substring logic
  const prefix = "0000000".substring(0, padLength);

  return prefix + policyId;
}

export function newProductCode(productCode: number): string {
  const policyId = productCode.toString();
  const padLength = 3 - policyId.length;

  // Equivalent to Java's substring logic
  const prefix = "000".substring(0, padLength);

  return prefix + policyId;
}

export async function coverageStatusUpdate(
  order_id: string,
  policy_number: string,
  policy_status: string,
  cnno: string,
  order_status: string
): Promise<ApiResponse> {
  const data = new FormData();
  data.append("order_id", order_id);
  data.append("policy_number", policy_number);
  data.append("policy_status", policy_status);
  data.append("cnno", cnno);
  data.append("order_status", order_status);

  const config = {
    method: "post" as const,
    maxBodyLength: Infinity,
    url: "https://jubileegeneral.com.pk/jgi_admin/api/retailResponse/policyStatusUpdate",
    headers: {
      Cookie: "qtrans_front_language=en",
      ...data.getHeaders(),
    },
    data,
  };

  try {
    const response = await axios.request(config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as AxiosError;
    return {
      success: false,
      error: err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message || "Network or unknown error",
    };
  }
}

export async function courierBooking(
  orderId: number,
  policyId: number,
  code: string,
  data: OrderSchema,
  result: any,
  req: Request
) {
  const city = await prisma.city.findUnique({
    where: { id: data.customer_city },
  });
  const ordertoken = encodeOrderCode(result.order.order_code);
  const policyDocumentUrl = `${process.env.BASE_URL}/policyDoc/${ordertoken}.pdf`;
  const courier = await getCourier(
    result.product.is_takaful == true ? true : false
  );
  if (!courier) return;

  const token = Buffer.from(`${courier.user}:${courier.password}`).toString(
    "base64"
  );

  const datatoSend = {
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
    customer_comment: policyDocumentUrl,
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
        sku_code: data.product_details.item_name,
      },
    ],
  };

  const response = await axios.post(courier.book_url, datatoSend, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
  });

  if (response.data?.status === "1") {
    await prisma.order.update({
      where: { id: orderId },
      data: { tracking_number: response.data.cnno, status: "pendingCOD" },
    });
    await prisma.policy.update({
      where: { id: policyId },
      data: { status: "pendingCOD" },
    });

    const apiUser = result.order.apiUser;
    const isCoverage = apiUser?.name.toLowerCase() == "coverage";

    if (isCoverage) {
      const coverageStatusResponse = await coverageStatusUpdate(
        result.order.order_code,
        result.code,
        "pendingCOD",
        response.data.cnno,
        "verified"
      );

      if (coverageStatusResponse.success) {
        await prisma.policy.update({
          where: { id: policyId },
          data: {
            qr_doc_url: `https://dev-coverage.jubileegeneral.com.pk/policydoc?policy_no=${result.code}`,
          },
        });

        return;
      } else {
        console.log("Failed:", coverageStatusResponse.error);
      }
    }

    // Email And Sms

    let logo: string = `${process.env.BASE_URL}/uploads/logo/insurance_logo.png`;
    let customerName: string = result.order.customer_name;
    let resultOrderId: string = result.order.order_code;
    let createdDate: string = result.order.create_date;
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
      result.product.product_name,
      result.policy.takaful_policy,
      false
    );
    const policyWordingUrl = `${process.env.BASE_URL}/uploads/policy-wordings/${policyWording.wordingFile}`;
    const extraDocs = policyWording.extraUrls.map((url) => ({
      filename: url,
      path: `${process.env.BASE_URL}/uploads/policy-wordings/${url}`,
      contentType: "application/pdf",
    }));

    if (result.policy.takaful_policy) {
      url = `${process.env.POLICY_VERIFICATION_TAKAFUL}`;
      logo = `${process.env.BASE_URL}/uploads/logo/takaful_logo.jpg`;
      Insurance = "Takaful";
      insurance = "";
      doc = "PMD(s)";
      buisness = "Takaful Retail Business Division";
      jubilee = "Jubilee General Takaful";
      takaful = true;
      smsString = `Dear ${result.order.customer_name}, Thank you for choosing Jubilee General ${result.product.product_name} .Your PMD # ${result.code} has been confirmed.You PMD will be delivered to you within 48 hours. Please call 0800-03786 for details.`;
    } else {
      url = `${process.env.POLICY_VERIFICATION_INSURANCE}`;
      logo = `${process.env.BASE_URL}/uploads/logo/insurance_logo.jpg`;
      Insurance = "Insurance";
      insurance = "insurance";
      doc = "policy document(s)";
      if (apiUser != null && apiUser.name.toLowerCase().includes("hblbanca")) {
        buisness = "Bancassurance Department";
      } else {
        buisness = "Retail Business Division";
      }
      jubilee = "Jubilee General Insurance";
      takaful = false;
      smsString = `Dear ${result.order.customer_name}, Thank you for choosing Jubilee General ${result.product.product_name}. Your Policy # ${result.code} has been confirmed.Your Policy will be delivered to you within 48 hours. Please call 0800-03786 for details.`;
    }

    await sendEmail({
      to: result.order.customer_email || "",
      subject: "Policy Order Successful",
      html: getOrderCODTemplate(
        logo,
        customerName,
        Insurance,
        insurance,
        doc,
        resultOrderId,
        createdDate,
        buisness,
        url,
        jubilee,
        takaful,
        result.product.product_name,
        result.order.received_premium,
        result.order.shipping_name,
        result.order.shipping_email,
        result.order.shipping_address,
        result.order.shipping_charges,
        result.order.shipping_phone,
        response.data.cnno
      ),
      // attachments: [
      //   {
      //     filename: `${result.code}.pdf`,
      //     path: policyDocumentUrl,
      //     contentType: "application/pdf",
      //   },
      //   {
      //     filename: policyWording.wordingFile,
      //     path: policyWordingUrl,
      //     contentType: "application/pdf",
      //   },
      //   ...extraDocs,
      // ],
    });

    if (
      !result.product.product_name.toLowerCase().includes("parents-care-plus")
    ) {
      await sendSms(result.order.customer_contact || "", smsString);
    } else {
      if (result.policy.takaful_policy) {
        await sendWhatsAppMessage({
          policyType: "takaful_digital",
          phoneNumber: result.order.customer_contact || "",
          params: [
            result.order.customer_name,
            result.plan.name,
            result.code,
            policyDocumentUrl,
          ],
        });
      } else {
        await sendWhatsAppMessage({
          policyType: "conventional_digital",
          phoneNumber: result.order.customer_contact || "",
          params: [
            result.order.customer_name,
            result.plan.name,
            result.code,
            policyDocumentUrl,
          ],
        });
      }
    }
  } else {
    console.error("BlueEx booking failed:", response.data);
  }
}

export async function courierBookingForRepush(
  orderId: number,
  policyId: number,
  orderCode: string,
  code: string,
  options: {
    shipping_name?: string;
    shipping_email?: string;
    shipping_phone?: string;
    shipping_address?: string;
    customer_city_id?: number;
    takaful_policy?: boolean;
    received_premium: number;
    product_name: string;
    sku: string;
  },
  tx: any
) {
  // Fetch city if provided
  const city = options.customer_city_id
    ? await tx.city.findUnique({
        where: { id: options.customer_city_id },
      })
    : null;
  const ordertoken = encodeOrderCode(orderCode);
  const policyDocumentUrl = `${process.env.BASE_URL}/policyDoc/${ordertoken}.pdf`;
  // Get courier
  const courier = await getCourier(options.takaful_policy ?? false);
  if (!courier) {
    console.error(
      "Courier not found for takaful status:",
      options.takaful_policy
    );
    return;
  }

  // Auth token
  const token = Buffer.from(`${courier.user}:${courier.password}`).toString(
    "base64"
  );

  const datatoSend = {
    shipper_name: "Jubilee General Insurance",
    shipper_email: "support@jubileegeneral.com.pk",
    shipper_contact: "021-111-654-321",
    shipper_address:
      "Jubilee General Insurance Co Ltd, 2nd Floor, Jubilee Insurance House, I. I. Chundrigar Road Karachi",
    shipper_city: "KHI",

    customer_name: options.shipping_name,
    customer_email: options.shipping_email,
    customer_contact: options.shipping_phone,
    customer_address: options.shipping_address,
    customer_city: city ? city.city_code : "KHI",
    customer_country: "PK",
    customer_comment: policyDocumentUrl,

    shipping_charges: "100",
    payment_type: "COD",
    service_code: "BE",
    total_order_amount: options.received_premium.toString(),
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
        product_name: options.product_name,
        product_price: options.received_premium.toString(),
        product_weight: "1",
        product_quantity: "1",
        product_variations: "document",
        sku_code: options.sku,
      },
    ],
  };

  try {
    const response = await axios.post(courier.book_url, datatoSend, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
      },
    });

    if (response.data?.status === "1") {
      await tx.order.update({
        where: { id: orderId },
        data: { tracking_number: response.data.cnno, status: "pendingCOD" },
      });
      await tx.policy.update({
        where: { id: policyId },
        data: { status: "pendingCOD" },
      });
    } else {
      console.error("BlueEx booking failed:", response.data);
    }
  } catch (err: any) {
    console.error("BlueEx courier error:", err.response?.data || err.message);
  }
}
