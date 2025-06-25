import axios from "axios";
import qs from "qs";

export const sendSms = async (sendTo: string, message: string) => {
  try {
    let formattedNumber = sendTo.replace(/[^0-9]/g, "");
    formattedNumber = formattedNumber.slice(-11);
    const recipient = `92${formattedNumber}`;

    const payload = {
      sender: process.env.SENDER,
      messagedata: message,
      username: process.env.SMS_USERNAME,
      password: process.env.SMS_PASSWORD,
      recipient: recipient,
      action: "sendmessage",
      format: "json",
    };

    const response = await axios.post(
      "https://gateway.its.com.pk/api",
      qs.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    return response;
  } catch (error: any) {
    throw new Error(`Sms send error: ${error.message}`);
  }
};
