import axios from "axios";
import { createPendingLog, updateLogFailure, updateLogSuccess } from "./communicationLogUtil";

const formatToPakistan = (sendTo: string): string => {
  let formattedNumber = sendTo.replace(/[^0-9]/g, "");
  if (formattedNumber.startsWith("92")) {
    return formattedNumber;
  } else if (formattedNumber.startsWith("0")) {
    return `92${formattedNumber.slice(1)}`;
  } else if (formattedNumber.length === 10 || formattedNumber.length === 11) {
    return `92${formattedNumber}`;
  } else {
    throw new Error(`Invalid mobile number: ${sendTo}`);
  }
};

export const sendSms = async (sendTo: string, message: string) => {
  const recipient = formatToPakistan(sendTo);

  const log = await createPendingLog({
    type: "sms",
    recipient,
    message,
    params: null,
  });

  try {
    const payload = {
      sender: process.env.SMS_SENDER || "Jubilee",
      messagedata: message,
      recipient,
      action: "sendmessage",
      username: process.env.SMS_USERNAME,
      password: process.env.SMS_PASSWORD,
    };

    const response = await axios.post(
      "https://gateway.its.com.pk/api",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    await updateLogSuccess(log.id, { status: response.status, data: response.data });
    return response;
  } catch (error: any) {
    await updateLogFailure(log.id, error?.message ?? JSON.stringify(error), { raw: error?.response?.data ?? error });
    throw new Error(`Sms send error: ${error.message}`);
  }
};
