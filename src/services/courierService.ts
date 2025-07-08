import prisma from "../config/db";
import {
  CourierType,
  CourierUpdateType,
} from "../validations/courierValidations";

export const getAllCouriers = async () => {
  try {
    const allCouriers = await prisma.courier.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allCouriers;
  } catch (error: any) {
    throw new Error(`Failed to fetch all couriers: ${error.message}`);
  }
};

export const createCourier = async (
  courier: CourierType,
  createdBy: number
) => {
  try {
    const data = {
      name: courier.name,
      api_code: courier.api_code,
      account_number: courier.account_number,
      user: courier.user,
      password: courier.password,
      created_by: createdBy,
      is_takaful: courier.is_takaful
    } as any;

    if (courier.book_url) {
      data["book_url"] = courier.book_url;
    }

    if (courier.tracking_url) {
      data["tracking_url"] = courier.tracking_url;
    }

    const newCourier = await prisma.courier.create({
      data,
    });
    return newCourier;
  } catch (error: any) {
    throw new Error(`Failed to create a courier: ${error.message}`);
  }
};

export const updateCourier = async (courier: CourierUpdateType) => {
  try {
    const data = {
      name: courier.name,
      api_code: courier.api_code,
      account_number: courier.account_number,
      user: courier.user,
      password: courier.password,
      is_takaful: courier.is_takaful,
    } as any;

    if (courier.book_url) {
      data["book_url"] = courier.book_url;
    }

    if (courier.tracking_url) {
      data["tracking_url"] = courier.tracking_url;
    }

    const updatedCourier = await prisma.courier.update({
      data,
      where: { id: courier.courier_id },
    });
    return updatedCourier;
  } catch (error: any) {
    throw new Error(`Failed to update a courier: ${error.message}`);
  }
};

export const getCourierByAccountNumber = async (account_number: string) => {
  return prisma.courier.findUnique({
    where: { account_number },
  });
};

export const getCourierById = async (id: number) => {
  return prisma.courier.findUnique({
    where: { id },
  });
};