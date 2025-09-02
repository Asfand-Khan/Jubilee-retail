import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  validateLeadInfoSchema,
  validateLeadInfoUpdateSchema,
} from "../validations/leadInfoValidations";
import {
  createLeadInfo,
  getAllLeadInfos,
  updateLeadStatus,
} from "../services/leadInfoService";
import { handleAppError } from "../utils/appErrorHandler";

// Module --> Lead info
// Method --> GET (Protected)
// Endpoint --> /api/v1/lead-info
// Description --> All Lead Info
export const getAllLeadInfoHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const leadInfos = await getAllLeadInfos();
    return res.status(200).json({
      status: 1,
      message: "Lead infos fetched successfully",
      payload: leadInfos,
    });
  } catch (error: any) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Lead info
// Method --> POST (Protected)
// Endpoint --> /api/v1/lead-infos
// Description --> Create Lead Info
export const createLeadInfoHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateLeadInfoSchema.parse(req.body);

    const newLeadInfo = await createLeadInfo(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Lead info created successfully",
      payload: [newLeadInfo],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Lead info
// Method --> POST (Protected)
// Endpoint --> /api/v1/lead-infos/status
// Description --> Update Lead Info status
export const updateLeadInfoStatusHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateLeadInfoUpdateSchema.parse(req.body);

    const newLeadInfo = await updateLeadStatus(parsedData);

    return res.status(201).json({
      status: 1,
      message: "Lead info created successfully",
      payload: [newLeadInfo],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
