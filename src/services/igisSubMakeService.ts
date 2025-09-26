import prisma from "../config/db";
import {
  IgisSubMakeType,
  IgisSubMakeUpdateType,
} from "../validations/igisSubMakeValidations";

export const getAllIgisSubMakes = async () => {
  try {
    const allIgisSubMakes = await prisma.igisSubMake.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allIgisSubMakes;
  } catch (error: any) {
    throw new Error(`Failed to fetch all igis sub makes: ${error.message}`);
  }
};

export const createIgisSubMake = async (
  igisSubMake: IgisSubMakeType,
  createdBy: number
) => {
  try {
    const data = {
      make_id: igisSubMake.make_id,
      sub_make_name: igisSubMake.sub_make_name,
      igis_sub_make_code: igisSubMake.igis_sub_make_code,
      created_by: createdBy,
    } as any;

    if (igisSubMake.seating_capacity) {
      data["seating_capacity"] = igisSubMake.seating_capacity;
    }

    if (igisSubMake.cubic_capacity) {
      data["cubic_capacity"] = igisSubMake.cubic_capacity;
    }

    if (igisSubMake.coi_type_code) {
      data["coi_type_code"] = igisSubMake.coi_type_code;
    }

    const newIgisSubMake = await prisma.igisSubMake.create({
      data,
    });
    return newIgisSubMake;
  } catch (error: any) {
    throw new Error(`Failed to create a igis sub make: ${error.message}`);
  }
};

export const updateIgisSubMake = async (igisSubMake: IgisSubMakeUpdateType) => {
  try {
    const data = {
      make_id: igisSubMake.make_id,
      sub_make_name: igisSubMake.sub_make_name,
      igis_sub_make_code: igisSubMake.igis_sub_make_code,
    } as any;

    if (igisSubMake.seating_capacity) {
      data["seating_capacity"] = igisSubMake.seating_capacity;
    }

    if (igisSubMake.cubic_capacity) {
      data["cubic_capacity"] = igisSubMake.cubic_capacity;
    }

    if (igisSubMake.coi_type_code) {
      data["coi_type_code"] = igisSubMake.coi_type_code;
    }

    const updatedIgisSubMake = await prisma.igisSubMake.update({
      data,
      where: {
        id: igisSubMake.sub_make_id,
      },
    });
    return updatedIgisSubMake;
  } catch (error: any) {
    throw new Error(`Failed to update a igis sub make: ${error.message}`);
  }
};

export const getIgisSubMakeByIgisSubMakeCode = async (code: string) => {
  return prisma.igisSubMake.findFirst({
    where: { igis_sub_make_code: code },
  });
};

export const getIgisSubMakeById = async (id: number) => {
  return prisma.igisSubMake.findUnique({
    where: { id },
  });
};
