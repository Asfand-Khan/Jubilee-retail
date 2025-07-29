import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  getPlanByPlanName,
  updatePlanById,
} from "../services/planService";
import {
  validatePlanCreate,
  validatePlanUpdate,
} from "../validations/planValidations";

// Module --> Plan
// Method --> GET (Protected)
// Endpoint --> /api/v1/plans
// Description --> Fetch all plans
export const getAllPlansHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allPlans = await getAllPlans();
    return res.status(200).json({
      status: 1,
      message: "Plans fetched successfully",
      payload: allPlans,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Plan
// Method --> POST (Protected)
// Endpoint --> /api/v1/plans
// Description --> Create plan
export const createPlanHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validatePlanCreate.parse(req.body);

    const planByPlanName = await getPlanByPlanName(parsedData.name);

    if (planByPlanName) {
      return res.status(400).json({
        status: 0,
        message: "Plan with name already exists",
        payload: [],
      });
    }

    const newPlan = await createPlan(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Plan created successfully",
      payload: [newPlan],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Plan
// Method --> GET (Protected)
// Endpoint --> /api/v1/plans/single
// Description --> Get single plan
export const getSinglePlanHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const planId = parseInt(req.body.id);

    if (isNaN(planId) || planId <= 0) {
      throw new Error("Invalid plan id");
    }

    const singlePlan = await getPlanById(planId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single plan successfully",
      payload: [singlePlan],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Plan
// Method --> PUT (Protected)
// Endpoint --> /api/v1/plans/
// Description --> Update plan
export const updatePlanHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validatePlanUpdate.parse(req.body);

    const updatedPlan = await updatePlanById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated plan successfully",
      payload: [updatedPlan],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
