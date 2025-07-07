import prisma from "../config/db";
import {
  BusinessRegionType,
  BusinessRegionUpdateType,
} from "../validations/businessRegionValidations";

export const getAllBusinessRegions = async () => {
  try {
    const allBusinessRegions = await prisma.businessRegion.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allBusinessRegions;
  } catch (error: any) {
    throw new Error(`Failed to fetch all Business Regions: ${error.message}`);
  }
};

export const createBusinessRegion = async (
  businessRegion: BusinessRegionType,
  createdBy: number
) => {
  try {
    const newBusinessRegion = await prisma.businessRegion.create({
      data: {
        business_region_name: businessRegion.business_region_name,
        igis_business_region_code: businessRegion.igis_business_region_code,
        created_by: createdBy,
      },
    });
    return newBusinessRegion;
  } catch (error: any) {
    throw new Error(`Failed to create a business region: ${error.message}`);
  }
};

export const updateBusinessRegion = async (
  businessRegion: BusinessRegionUpdateType
) => {
  try {
    const updatedBusinessRegion = await prisma.businessRegion.update({
      data: {
        business_region_name: businessRegion.business_region_name,
        igis_business_region_code: businessRegion.igis_business_region_code,
      },
      where: { id: businessRegion.business_region_id },
    });
    return updatedBusinessRegion;
  } catch (error: any) {
    throw new Error(`Failed to update a business region: ${error.message}`);
  }
};

export const getBusinessRegionByIGISBusinessRegionCode = async (
  code: string
) => {
  return prisma.businessRegion.findUnique({
    where: { igis_business_region_code: code },
  });
};

export const getBusinessRegionById = async (id: number) => {
  return prisma.businessRegion.findUnique({
    where: { id },
  });
};
