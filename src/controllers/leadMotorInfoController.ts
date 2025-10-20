import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { handleAppError } from "../utils/appErrorHandler";
import {
  createLeadMotorInfo,
  getAllLeadMotorInfos,
  updateLeadMotorStatus,
} from "../services/leadMotorInfoService";
import { validateLeadMotorInfoListing, validateLeadMotorInfoSchema, validateLeadMotorInfoUpdateSchema } from "../validations/leadMotorInfoValidations";

// Module --> Lead Motor info
// Method --> GET (Protected)
// Endpoint --> /api/v1/lead-motor-info
// Description --> All Motor Lead Info
export const getAllLeadMotorInfoHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validateLeadMotorInfoListing.parse(req.body);
    const leadMotorInfos = await getAllLeadMotorInfos(parsed);
    return res.status(200).json({
      status: 1,
      message: "Lead motor infos fetched successfully",
      payload: leadMotorInfos,
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

// Module --> Lead motor info
// Method --> POST (Protected)
// Endpoint --> /api/v1/lead-motor-infos
// Description --> Create Lead Motor Info
export const createLeadMotorInfoHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateLeadMotorInfoSchema.parse(req.body);

    const newLeadMotorInfo = await createLeadMotorInfo(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Lead motor info created successfully",
      payload: [newLeadMotorInfo],
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
// Endpoint --> /api/v1/lead-motor-infos/status
// Description --> Update Lead Motor Info status
export const updateLeadMotorInfoStatusHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateLeadMotorInfoUpdateSchema.parse(req.body);

    const updatedLeadMotorInfo = await updateLeadMotorStatus(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Lead motor info status updated successfully",
      payload: [updatedLeadMotorInfo],
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
