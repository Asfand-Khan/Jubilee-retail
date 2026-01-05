import dayjs from "dayjs";
import prisma from "../config/db";
import { ICommunication } from "../validations/communicationValidations";

export type CommunicationType = "email" | "sms" | "whatsapp";

export interface CreateLogInput {
  type: CommunicationType;
  recipient: string;
  subject?: string | null;
  message?: string | null;
  htmlContent?: string | null;
  params?: any;
  referenceType?: string | null;
  referenceId?: number | null;
}

export const createPendingLog = async (input: CreateLogInput) => {
  const log = await prisma.communicationLog.create({
    data: {
      type: input.type,
      recipient: input.recipient,
      subject: input.subject ?? null,
      message: input.message ?? null,
      htmlContent: input.htmlContent ?? null,
      params: input.params ?? null,
      status: "pending",
      reference_type: input.referenceType ?? null,
      reference_id: input.referenceId ?? null,
      last_attempt_at: new Date(),
    },
  });
  return log;
};

export const updateLogSuccess = async (id: number, responseData: any) => {
  return prisma.communicationLog.update({
    where: { id },
    data: {
      status: "sent",
      response_data: responseData ?? null,
      error_message: null,
      retried_count: { increment: 1 },
      last_attempt_at: new Date(),
    },
  });
};

export const updateLogFailure = async (
  id: number,
  errorMessage: string,
  responseData?: any
) => {
  return prisma.communicationLog.update({
    where: { id },
    data: {
      status: "failed",
      error_message: errorMessage,
      response_data: responseData ?? null,
      retried_count: { increment: 1 },
      last_attempt_at: new Date(),
    },
  });
};

export const getLogById = async (id: number) => {
  return prisma.communicationLog.findUnique({ where: { id } });
};

export const listLogs = async (data: ICommunication) => {
  const where: any = {};
  if (data.date) {
    const [startStr, endStr] = data.date.split("to").map((d) => d.trim());

    const startDate = dayjs(startStr).startOf("day").toDate();
    const endDate = dayjs(endStr).endOf("day").toDate();

    where.created_at = {
      gte: startDate,
      lte: endDate,
    };
  }

  const payload = await prisma.communicationLog.findMany({
    where,
    orderBy: { id: "desc" },
  });

  return payload;
};
