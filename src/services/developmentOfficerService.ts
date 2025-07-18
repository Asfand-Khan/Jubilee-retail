import prisma from "../config/db";
import {
  DevelopmentOfficerType,
  DevelopmentOfficerUpdateType,
} from "../validations/developmentOfficerValidations";

export const getAllDOs = async () => {
  try {
    const allDos = await prisma.developmentOfficer.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allDos;
  } catch (error: any) {
    throw new Error(`Failed to fetch all DOs: ${error.message}`);
  }
};

export const createDO = async (
  DO: DevelopmentOfficerType,
  createdBy: number
) => {
  try {
    const data = {
      name: DO.name,
      branch_id: DO.branch_id,
      igis_do_code: DO.igis_do_code,
      created_by: createdBy,
    } as any;

    if (DO.igis_code) {
      data["igis_code"] = DO.igis_code;
    }

    const newDevelopmentOfficer = await prisma.developmentOfficer.create({
      data,
    });
    return newDevelopmentOfficer;
  } catch (error: any) {
    throw new Error(`Failed to create a development officer: ${error.message}`);
  }
};

export const updateDO = async (DO: DevelopmentOfficerUpdateType) => {
  try {
    const data = {
      name: DO.name,
      branch_id: DO.branch_id,
      igis_do_code: DO.igis_do_code,
    } as any;

    if (DO.igis_code) {
      data["igis_code"] = DO.igis_code;
    }

    const updatedDevelopmentOfficer = await prisma.developmentOfficer.update({
      data,
      where: {
        id: DO.do_id,
      },
    });
    return updatedDevelopmentOfficer;
  } catch (error: any) {
    throw new Error(`Failed to update a development officer: ${error.message}`);
  }
};

export const getDOByIGISDOCode = async (code: string) => {
  return prisma.developmentOfficer.findUnique({
    where: { igis_do_code: code },
  });
};

export const getDOById = async (id: number) => {
  return prisma.developmentOfficer.findUnique({
    where: { id },
  });
};
