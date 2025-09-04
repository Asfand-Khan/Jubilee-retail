import prisma from "../config/db";
import {
  PremiumRangeProtectionSchema,
  UpdatePremiumRangeProtectionSchema,
} from "../validations/premiumRangeProtectionValidation";

export const getAllPremiumRangeProtections = async () => {
  try {
    return await prisma.premiumRangeProtection.findMany({
      where: { is_deleted: false },
      include: {
        apiUser: true,
        createdBy: true,
        deletedBy: true,
      },
    });
  } catch (error: any) {
    throw new Error(
      `Failed to fetch Premium Range Protections: ${error.message}`
    );
  }
};

export const getPremiumRangeProtectionById = async (id: number) => {
  try {
    return await prisma.premiumRangeProtection.findUnique({
      where: { id },
      include: {
        apiUser: true,
        createdBy: true,
        deletedBy: true,
      },
    });
  } catch (error: any) {
    throw new Error(
      `Failed to fetch Premium Range Protection: ${error.message}`
    );
  }
};

export const createPremiumRangeProtection = async (
  data: PremiumRangeProtectionSchema,
  createdBy: number
) => {
  try {
    const newRecord = await prisma.premiumRangeProtection.create({
      data: {
        premium_start: data.premium_start,
        premium_end: data.premium_end,
        net_premium: data.net_premium,
        api_user_id: data.api_user_id,
        duration: data.duration,
        duration_type: data.duration_type,
        created_by: createdBy,
      },
    });
    return newRecord;
  } catch (error: any) {
    throw new Error(
      `Failed to create Premium Range Protection: ${error.message}`
    );
  }
};

export const updatePremiumRangeProtection = async (
  data: UpdatePremiumRangeProtectionSchema
) => {
  try {
    const updatedRecord = await prisma.premiumRangeProtection.update({
      where: { id: data.id },
      data: {
        premium_start: data.premium_start,
        premium_end: data.premium_end,
        net_premium: data.net_premium,
        api_user_id: data.api_user_id,
        duration: data.duration,
        duration_type: data.duration_type,
      },
    });
    return updatedRecord;
  } catch (error: any) {
    throw new Error(
      `Failed to update Premium Range Protection: ${error.message}`
    );
  }
};
