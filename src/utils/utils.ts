// src/utils/utils.ts

import dayjs from "dayjs";
import { Request } from "express";
import { getPolicyWording } from "./getPolicyWordings";
import { sendEmail } from "./sendEmail";
import { getOrderB2BTemplate } from "./getOrderB2BTemplate";
import { sendSms } from "./sendSms";
import { sendWhatsAppMessage } from "./sendWhatsappSms";
import { encodeOrderCode } from "./base64Url";

export function calculateAge(dobString: string | null | undefined): number {
  if (!dobString) return 0;

  // Attempt to parse various date formats (Java uses Date object, we use string/dayjs)
  const dob = dayjs(dobString);
  if (!dob.isValid()) return 0;

  return dayjs().diff(dob, "year");
}

export function isFBLRiderPresent(
  isFaysalBankOrder: boolean,
  policy: any
): boolean {
  // This logic needs external context, mocking based on simple assumption
  return isFaysalBankOrder && policy.FblPolicyRider?.length > 0;
}

export async function sendVerificationNotifications(
  updatedPolicy: any,
  order: any,
  req: Request
) {
  const baseUrl = `${process.env.BASE_URL}`;
  const token = encodeOrderCode(order.order_code);
  const policyDocumentUrl = `${process.env.BASE_URL}/policyDoc/${token}.pdf`;

  const apiUser = order.apiUser;
  const wording = getPolicyWording(
    apiUser?.name.toLowerCase(),
    updatedPolicy.product.product_name,
    updatedPolicy.takaful_policy,
    false
  );

  const wordingUrl = `${baseUrl}/uploads/policy-wordings/${wording.wordingFile}`;
  const extraDocs = wording.extraUrls.map((file) => ({
    filename: file,
    path: `${baseUrl}/uploads/policy-wordings/${file}`,
    contentType: "application/pdf",
  }));

  const {
    logo,
    smsString,
    jubilee,
    buisness,
    Insurance,
    insurance,
    doc,
    takaful,
    url,
  } = buildInsuranceMetadata(order, updatedPolicy, policyDocumentUrl, req);

  await sendEmail({
    to: order.customer_email,
    subject: "Policy Order Successful",
    html: getOrderB2BTemplate(
      logo,
      order.customer_name,
      Insurance,
      insurance,
      doc,
      order.order_code,
      order.create_date,
      buisness,
      url,
      jubilee,
      takaful,
      updatedPolicy.product.product_name,
      order.received_premium
    ),
    attachments: [
      {
        filename: `${updatedPolicy.policy_code}.pdf`,
        path: policyDocumentUrl,
        contentType: "application/pdf",
      },
      {
        filename: wording.wordingFile,
        path: wordingUrl,
        contentType: "application/pdf",
      },
      ...extraDocs,
    ],
  });

  // Send SMS/WhatsApp selectively
  if (
    !updatedPolicy.product.product_name
      .toLowerCase()
      .includes("parents-care-plus")
  ) {
    await sendSms(order.customer_contact, smsString);
  } else {
    await sendWhatsAppMessage({
      policyType: takaful ? "takaful_digital" : "conventional_digital",
      phoneNumber: order.customer_contact,
      params: [
        order.customer_name,
        updatedPolicy.plan.name,
        updatedPolicy.policy_code,
        policyDocumentUrl,
      ],
    });
  }
}

function buildInsuranceMetadata(
  order: any,
  updatedPolicy: any,
  policyDocumentUrl: string,
  req: Request
) {
  const baseLogo = `${process.env.BASE_URL}/uploads/logo`;
  const apiUserName = order.apiUser?.name?.toLowerCase() || "";
  const takaful = updatedPolicy.takaful_policy;

  if (takaful) {
    return {
      url: `${process.env.POLICY_VERIFICATION_TAKAFUL}`,
      logo: `${baseLogo}/takaful_logo.jpg`,
      Insurance: "Takaful",
      insurance: "",
      doc: "PMD(s)",
      buisness: "Takaful Retail Business Division",
      jubilee: "Jubilee General Takaful",
      takaful: true,
      smsString: `Dear ${order.customer_name}, Thank you for choosing Jubilee General ${updatedPolicy.product.product_name}. Your PMD # is ${updatedPolicy.policy_code}. Click here to view your PMD: ${policyDocumentUrl}. For more information please dial our toll free # 0800 03786`,
    };
  }

  return {
    url: `${process.env.POLICY_VERIFICATION_INSURANCE}`,
    logo: `${baseLogo}/insurance_logo.jpg`,
    Insurance: "Insurance",
    insurance: "insurance",
    doc: "policy document(s)",
    buisness: apiUserName.includes("hblbanca")
      ? "Bancassurance Department"
      : "Retail Business Division",
    jubilee: "Jubilee General Insurance",
    takaful: false,
    smsString: `Dear ${order.customer_name}, Thank you for choosing Jubilee General ${updatedPolicy.product.product_name}. Your Policy # is ${updatedPolicy.policy_code}. Click here to view your Policy: ${policyDocumentUrl}. For more information please dial our toll free # 0800 03786`,
  };
}

