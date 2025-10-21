import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  createPendingLog,
  updateLogFailure,
  updateLogSuccess,
} from "./communicationLogUtil";

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  attachments?: SMTPTransport.Options["attachments"];
  bcc?: string | string[];
  cc?: string | string[];
}

export const sendEmail = async (options: SendEmailOptions) => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  } as SMTPTransport.Options);

  // Create pending log first
  const log = await createPendingLog({
    type: "email",
    recipient: options.to,
    subject: options.subject,
    message: options.text ?? null,
    htmlContent: options.html ?? null,
    params: {
      bcc: options.bcc ?? null,
      cc: options.cc ?? null,
      attachments: options.attachments ?? null,
    },
  });

  // Optional: Verify connection before sending
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP connection failed:", error);
    } else {
      console.log("SMTP connection established successfully");
    }
  });

  const mailOptions: SMTPTransport.Options = {
    from: `"${options.fromName || "Jubilee General"}" <${
      process.env.SMTP_EMAIL
    }>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    bcc: options.bcc || undefined,
    cc: options.cc || undefined,
    attachments: options.attachments || undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    await updateLogSuccess(log.id, { info });
    return info;
  } catch (error: any) {
    await updateLogFailure(log.id, error?.message ?? JSON.stringify(error), {
      raw: error,
    });
    throw new Error(`Email send error: ${JSON.stringify(error)}`);
  }
};
