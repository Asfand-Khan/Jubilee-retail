import { Request, Response } from "express";
import prisma from "../config/db";
import {
  validateCommunication,
  validateRepushCommunication,
} from "../validations/communicationValidations";
import { sendEmail } from "../utils/sendEmail";
import { sendSms } from "../utils/sendSms";
import { sendWhatsAppMessage } from "../utils/sendWhatsappSms";
import { getLogById, listLogs } from "../utils/communicationLogUtil";

export const listCommunicationLogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateCommunication.parse(req.body);
    const logs = await listLogs(parsed);

    return res.status(200).json({
      status: 1,
      message: "Communication logs fetched successfully",
      payload: logs,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

export const repushCommunicationLog = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateRepushCommunication.parse(req.body);
    const { communication_log_id: id } = parsed;

    const log = await getLogById(id);
    if (!log) throw new Error("Communication log not found");

    let result;
    let error: string | null = null;

    let params: Record<string, any> = {};

    if (typeof log.params === "object" && log.params !== null) {
      params = log.params as Record<string, any>;
    } else if (typeof log.params === "string") {
      try {
        params = JSON.parse(log.params);
      } catch {
        params = {};
      }
    }

    switch (log.type) {
      case "email": {
        const emailOptions = {
          to: log.recipient,
          subject: log.subject ?? "",
          html: log.htmlContent ?? undefined,
          text: log.message ?? undefined,
          bcc: params.bcc,
          cc: params.cc,
          attachments: params.attachments,
          referenceType: log.reference_type ?? undefined,
          referenceId: log.reference_id ?? undefined,
        };
        result = await sendEmail(emailOptions);
        break;
      }

      case "sms": {
        result = await sendSms(log.recipient, log.message ?? "");
        break;
      }

      case "whatsapp": {
        const waPayload = {
          policyType: params.policyType,
          phoneNumber: log.recipient,
          params: params.params ?? [],
        };
        result = await sendWhatsAppMessage(waPayload as any);
        break;
      }

      default:
        throw new Error("Unsupported communication type");
    }

    // Update the log status
    await prisma.communicationLog.update({
      where: { id: log.id },
      data: {
        status: "sent",
        response_data: result,
        error_message: null,
        retried_count: { increment: 1 },
        last_attempt_at: new Date(),
      },
    });

    return res.status(200).json({
      status: 1,
      message: "Communication re-sent successfully",
      payload: result,
    });
  } catch (error: any) {
    try {
      const parsed = validateRepushCommunication.parse(req.body);
      const { communication_log_id: id } = parsed;
      if (id) {
        await prisma.communicationLog.update({
          where: { id },
          data: {
            status: "failed",
            error_message: error?.message ?? String(error),
            retried_count: { increment: 1 },
            last_attempt_at: new Date(),
          },
        });
      }
    } catch (e: any) {
      return res.status(500).json({
        status: 0,
        message: e.message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
