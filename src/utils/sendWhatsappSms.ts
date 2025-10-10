import axios from "axios";

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

export const sendWhatsAppMessage = async ({
  policyType,
  phoneNumber,
  params,
  orderId = "",
  status = "Pending",
  site = "Jubilee General Takaful",
}: WhatsAppParams): Promise<WhatsAppResponse> => {
  try {
    // Fixed token
    const xtUserToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRUb2tlbklkIjoiNzM2OWYzYzYtMDUwZi00MzgwLTkzZmUtOWRhMjkxODM1MjEzIiwiY2xpZW50VXVpZCI6IjkxNjJkNjIwLTQ1NWUtNDAwNi04ZTM5LWNhNmZhZTEyYzA0MCIsImNsaWVudCI6Ijk3IiwiYWN0b3IiOiIyNjciLCJ1c2VyVG9rZW5JZCI6Ijg5ZjlkYjM1LTM0ZDQtNDUzNy04MzRkLWEwZTI2Y2U4M2M2YiIsInRpbWUiOjE3NTAzMjkzMTc3NTEsIm1heF90b2tlbl9jb3VudCI6LTEsImlhdCI6MTc1MDMyOTMxN30.D7ts1Ed2ZHyR6Cu6Ep9vNEsVIS86bPDm3DEJl8eZxpw";

    let formattedNumber = phoneNumber.replace(/[^0-9]/g, "");

    if (formattedNumber.startsWith("92")) {
      // already correct
    } else if (formattedNumber.startsWith("0")) {
      formattedNumber = `92${formattedNumber.slice(1)}`;
    } else if (formattedNumber.length === 10 || formattedNumber.length === 11) {
      formattedNumber = `92${formattedNumber}`;
    } else {
      throw new Error(`Invalid mobile number: ${phoneNumber}`);
    }

    // Configuration mapping for policy templates
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

    // Validate policy type
    if (!policyConfig[policyType]) {
      return { success: false, response: null, error: `Invalid policy type: ${policyType}` };
    }

    // Validate phone format
    // if (!/^\+\d{10,15}$/.test(phoneNumber)) {
    //   return {
    //     success: false,
    //     response: null,
    //     error: `Invalid phone number format: ${phoneNumber}`,
    //   };
    // }

    // Prepare template parameters
    const templateParams = params.map((value, index) => ({
      paramName: "",
      sampleValue: policyConfig[policyType].param_samples[index],
      value,
    }));

    // Create payload
    const payload = {
      clientId: "97",
      template_message_id: policyConfig[policyType].template_id,
      numbers: formattedNumber,
      template_params: {
        body: {
          type: "BODY",
          text: policyConfig[policyType].message_text,
          parameters: templateParams,
        },
      },
    };

    // Perform API call using axios
    const response = await axios.post(
      "https://waba-be-whatsapp.its.com.pk/v1/template/message",
      payload,
      {
        headers: {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
          "xt-user-token": xtUserToken,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
          "origin": "https://waba-whatsapp.its.com.pk",
          "referer": "https://waba-whatsapp.its.com.pk/templateMessage-hsm",
        },
        timeout: 15000,
      }
    );

    // Return structured success response
    return {
      success: response.status >= 200 && response.status < 300,
      response: response.data,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      response: null,
      error: error.message || "Unknown error occurred",
    };
  }
};