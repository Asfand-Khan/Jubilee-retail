import prisma from "../config/db";

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

export const listLogs = async (filters: any, page = 1, limit = 20) => {
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.recipient)
    where.recipient = { contains: String(filters.recipient) };

  const [payload, total] = await Promise.all([
    prisma.communicationLog.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.communicationLog.count({ where }),
  ]);

  return { payload, total };
};
