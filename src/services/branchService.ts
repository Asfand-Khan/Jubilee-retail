import prisma from "../config/db";
import { BranchType, BranchUpdateType } from "../validations/branchValidations";

export const getAllBranches = async () => {
  try {
    const allBranches = await prisma.branch.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allBranches;
  } catch (error: any) {
    throw new Error(`Failed to fetch all branches: ${error.message}`);
  }
};

export const createBranch = async (branch: BranchType, createdBy: number) => {
  try {
    const newBranch = await prisma.branch.create({
      data: {
        address: branch.address,
        admin_rate: branch.admin_rate,
        email: branch.email,
        fed_insurance_fee: branch.fed_insurance_fee,
        his_code: branch.his_code,
        his_code_takaful: branch.his_code_takaful,
        igis_branch_code: branch.igis_branch_code,
        igis_branch_takaful_code: branch.igis_takaful_code,
        name: branch.name,
        sales_tax_perc: branch.sales_tax_perc,
        stamp_duty: branch.stamp_duty,
        telephone: branch.phone,
        created_by: createdBy,
      },
    });
    return newBranch;
  } catch (error: any) {
    throw new Error(`Failed to create a branch: ${error.message}`);
  }
};

export const getBranchByIGISBranchCode = async (code: string) => {
  return prisma.branch.findUnique({
    where: { igis_branch_code: code },
  });
};

export const getBranchByIGISTakafulCode = async (takafulCode: string) => {
  return prisma.branch.findUnique({
    where: { igis_branch_takaful_code: takafulCode },
  });
};

export const getBranchByHISBranchCode = async (hisBranchCode: string) => {
  return prisma.branch.findUnique({
    where: { his_code: hisBranchCode },
  });
};

export const getBranchByHISTakafulCode = async (hisTakafulCode: string) => {
  return prisma.branch.findUnique({
    where: { his_code_takaful: hisTakafulCode },
  });
};

export const getBranchById = async (branchId: number) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });
    return branch;
  } catch (error: any) {
    throw new Error(`Failed to single branch: ${error.message}`);
  }
};

export const updateBranchById = async (branch: BranchUpdateType) => {
  try {
    const updatedBranch = await prisma.branch.update({
      where: {
        id: branch.branch_id,
      },
      data: {
        address: branch.address,
        admin_rate: branch.admin_rate,
        email: branch.email,
        fed_insurance_fee: branch.fed_insurance_fee,
        his_code: branch.his_code,
        his_code_takaful: branch.his_code_takaful,
        igis_branch_code: branch.igis_branch_code,
        igis_branch_takaful_code: branch.igis_takaful_code,
        name: branch.name,
        sales_tax_perc: branch.sales_tax_perc,
        stamp_duty: branch.stamp_duty,
        telephone: branch.phone,
      },
    });
    return updatedBranch;
  } catch (error: any) {
    throw new Error(`Failed to update a branch: ${error.message}`);
  }
};
