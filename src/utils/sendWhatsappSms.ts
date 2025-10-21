import axios from "axios";
import {
  createPendingLog,
  updateLogFailure,
  updateLogSuccess,
} from "./communicationLogUtil";

// Define TypeScript types for better clarity
type PolicyType =
  | "takaful_physical"
  | "takaful_digital"
  | "conventional_physical"
  | "conventional_digital";

interface WhatsAppParams {
  policyType: PolicyType;
  phoneNumber: string; // e.g., "+923001234567"
  params: string[]; // dynamic message parameters
  orderId?: string;
  status?: string;
  site?: string;
}

interface WhatsAppResponse {
  success: boolean;
  response: any;
  error?: string | null;
}

const xtUserToken = process.env.WABA_XT_USER_TOKEN || "";

const policyConfig: Record<
  PolicyType,
  { template_id: string; message_text: string; param_samples: string[] }
> = {
  takaful_physical: {
    template_id: "1569",
    message_text:
      "Dear {{1}},\n\nYour {{2}} has been confirmed with the PMD # {{3}}. Your PMD will be delivered to you soon.\n\nFor more information, please reply to this message or call on our toll-free number 0800033786.",
    param_samples: ["Customer Name", "Plan Name", "PMD Number"],
  },
  takaful_digital: {
    template_id: "1567",
    message_text:
      "Dear {{1}},\n\nYour {{2}} has been confirmed with the PMD # {{3}}. You can access your PMD via {{4}}.\n\nFor more information, please reply to this message or call on our toll-free number 0800033786.",
    param_samples: ["Customer Name", "Plan Name", "PMD Number", "Link"],
  },
  conventional_physical: {
    template_id: "1570",
    message_text:
      "Dear {{1}},\n\nYour {{2}} has been confirmed with Policy Document # {{3}}. Your Policy Document will be delivered to you soon.\n\nFor more information, please reply to this message or call on our toll-free number 0800033786.",
    param_samples: ["Customer Name", "Plan Name", "Policy Document Number"],
  },
  conventional_digital: {
    template_id: "1568",
    message_text:
      "Dear {{1}},\n\nYour {{2}} has been confirmed with Policy Document # {{3}}. You can access your policy document via {{4}}.\n\nFor more information, please reply to this message or call on our toll-free number 0800033786.",
    param_samples: [
      "Customer Name",
      "Plan Name",
      "Policy Document Number",
      "Link",
    ],
  },
};

const formatToPakistan = (phoneNumber: string) => {
  let n = phoneNumber.replace(/[^0-9]/g, "");
  if (n.startsWith("92")) return n;
  if (n.startsWith("0")) return `92${n.slice(1)}`;
  if (n.length === 10 || n.length === 11) return `92${n}`;
  throw new Error(`Invalid mobile number: ${phoneNumber}`);
};

export const sendWhatsAppMessage = async (
  p: WhatsAppParams
): Promise<WhatsAppResponse> => {
  const recipient = formatToPakistan(p.phoneNumber);

  const log = await createPendingLog({
    type: "whatsapp",
    recipient,
    message: null,
    params: p,
  });

  try {
    if (!policyConfig[p.policyType]) {
      throw new Error(`Invalid policy type: ${p.policyType}`);
    }

    const templateParams = p.params.map((value, index) => ({
      paramName: "",
      sampleValue: policyConfig[p.policyType].param_samples[index],
      value,
    }));

    const payload = {
      clientId: "97",
      template_message_id: policyConfig[p.policyType].template_id,
      numbers: recipient,
      template_params: {
        body: {
          type: "BODY",
          text: policyConfig[p.policyType].message_text,
          parameters: templateParams,
        },
      },
    };

    const response = await axios.post(
      "https://waba-be-whatsapp.its.com.pk/v1/template/message",
      payload,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
          "xt-user-token": xtUserToken,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
          origin: "https://waba-whatsapp.its.com.pk",
          referer: "https://waba-whatsapp.its.com.pk/templateMessage-hsm",
        },
        timeout: 15000,
      }
    );

    await updateLogSuccess(log.id, {
      status: response.status,
      data: response.data,
    });
    return {
      success: response.status >= 200 && response.status < 300,
      response: response.data,
      error: null,
    };
  } catch (error: any) {
    await updateLogFailure(log.id, error?.message ?? String(error), {
      raw: error?.response?.data ?? error,
    });
    return {
      success: false,
      response: null,
      error: error.message || "Unknown error occurred",
    };
  }
};
