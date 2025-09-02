import prisma from "../config/db";
import {
  PaymentModeType,
  SinglePaymentModeType,
  UpdatePaymentModeType,
} from "../validations/paymentModesValidations";

export const allPaymentModes = async () => {
  const allPaymentModes = await prisma.paymentMode.findMany({
    where: {
      is_deleted: false,
    },
  });
  return allPaymentModes;
};

export const createPaymentMode = async (
  data: PaymentModeType,
  createdBy: number
) => {
  const newPaymentMode = await prisma.paymentMode.create({
    data: {
      name: data.name,
      payment_code: data.payment_code,
      created_by: createdBy,
    },
  });

  return newPaymentMode;
};

export const updatePaymentMode = async (data: UpdatePaymentModeType) => {
  const updatedPaymentMode = await prisma.paymentMode.update({
    where: {
      id: data.payment_mode_id,
    },
    data: {
      name: data.name,
      payment_code: data.payment_code,
    },
  });

  return updatedPaymentMode;
};

export const paymentModeById = async (data: SinglePaymentModeType) => {
  const paymentMode = await prisma.paymentMode.findUnique({
    where: {
      id: data.payment_mode_id,
    },
  });

  return paymentMode;
};

export const paymentModeByPaymentCode = async (paymentCode: string) => {
  const paymentMode = await prisma.paymentMode.findUnique({
    where: {
      payment_code: paymentCode,
    },
  });

  return paymentMode;
};
