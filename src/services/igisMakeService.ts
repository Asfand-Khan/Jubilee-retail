import prisma from "../config/db";
import {
  IgisMakeType,
  IgisMakeUpdateType,
} from "../validations/igisMakeValidations";

export const getAllIgisMakes = async () => {
  try {
    const allIgisMakes = await prisma.igisMake.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allIgisMakes;
  } catch (error: any) {
    throw new Error(`Failed to fetch all igis makes: ${error.message}`);
  }
};

export const createIgisMake = async (
  igisMake: IgisMakeType,
  createdBy: number
) => {
  try {
    const newIgisMake = await prisma.igisMake.create({
      data: {
        make_name: igisMake.make_name,
        igis_make_code: igisMake.igis_make_code,
        created_by: createdBy,
      },
    });
    return newIgisMake;
  } catch (error: any) {
    throw new Error(`Failed to create a igis make: ${error.message}`);
  }
};

export const updateIgisMake = async (igisMake: IgisMakeUpdateType) => {
  try {
    const updatedIgisMake = await prisma.igisMake.update({
      data: {
        make_name: igisMake.make_name,
        igis_make_code: igisMake.igis_make_code,
      },
      where: {
        id: igisMake.make_id,
      },
    });
    return updatedIgisMake;
  } catch (error: any) {
    throw new Error(`Failed to update a igis make: ${error.message}`);
  }
};

export const getIgisMakeByIgisMakeCode = async (code: string) => {
  return prisma.igisMake.findFirst({
    where: { igis_make_code: code },
  });
};

export const getIgisMakeById = async (id: number) => {
  return prisma.igisMake.findUnique({
    where: { id },
  });
};
