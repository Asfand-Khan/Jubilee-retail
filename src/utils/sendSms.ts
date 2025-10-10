import axios from "axios";

export const sendSms = async (sendTo: string, message: string) => {
  try {
    let formattedNumber = sendTo.replace(/[^0-9]/g, "");

    if (formattedNumber.startsWith("92")) {
      // already correct
    } else if (formattedNumber.startsWith("0")) {
      formattedNumber = `92${formattedNumber.slice(1)}`;
    } else if (formattedNumber.length === 10 || formattedNumber.length === 11) {
      formattedNumber = `92${formattedNumber}`;
    } else {
      throw new Error(`Invalid mobile number: ${sendTo}`);
    }

    const payload = {
      sender: process.env.SMS_SENDER || "Jubilee",
      messagedata: message,
      recipient: formattedNumber,
      action: "sendmessage",
      // format: "json",
      username: process.env.SMS_USERNAME,
      password: process.env.SMS_PASSWORD,
    };

    const response = await axios.post(
      "https://gateway.its.com.pk/api",
      payload
      ,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    console.log("✅ SMS Sent Successfully");
    console.log(response);
    return response;
  } catch (error: any) {
    throw new Error(`Sms send error: ${error.message}`);
  }
};
