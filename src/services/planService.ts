import prisma from "../config/db";
import { PlanType, PlanUpdateType } from "../validations/planValidations";

export const getAllPlans = async () => {
  try {
    const allPlans = await prisma.plan.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allPlans;
  } catch (error: any) {
    throw new Error(`Failed to fetch all plans: ${error.message}`);
  }
};

export const createPlan = async (plan: PlanType, createdBy: number) => {
  try {
    const newPlan = await prisma.plan.create({
      data: {
        name: plan.name,
        created_by: createdBy,
      },
    });
    return newPlan;
  } catch (error: any) {
    throw new Error(`Failed to create a plan: ${error.message}`);
  }
};

export const getPlanByPlanName = async (name: string) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { name },
    });
    return plan;
  } catch (error: any) {
    throw new Error(`Failed to single plan by name: ${error.message}`);
  }
};

export const getPlanById = async (planId: number) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });
    return plan;
  } catch (error: any) {
    throw new Error(`Failed to single plan by id: ${error.message}`);
  }
};

export const updatePlanById = async (plan: PlanUpdateType) => {
  try {
    const updatedPlan = await prisma.plan.update({
      where: {
        id: plan.plan_id,
      },
      data: {
        name: plan.name,
      },
    });
    return updatedPlan;
  } catch (error: any) {
    throw new Error(`Failed to update a plan: ${error.message}`);
  }
};
