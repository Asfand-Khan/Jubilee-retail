import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import * as service from "../services/premiumRateRangeProtectionService";
import * as validations from "../validations/premiumRangeProtectionValidation";
import { handleAppError } from "../utils/appErrorHandler";

// GET all
export const getAllPremiumRangeProtectionsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const records = await service.getAllPremiumRangeProtections();
    return res.status(200).json({
      status: 1,
      message: "Fetched all Premium Range Protections successfully",
      payload: records,
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

// GET one
export const getSinglePremiumRangeProtectionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validations.validateSinglePremiumRangeProtectionSchema.parse(
      req.body
    );

    const record = await service.getPremiumRangeProtectionById(parsedData.id);
    if (!record) {
      return res.status(400).json({
        status: 0,
        message: "Premium Range Protection not found",
        payload: [],
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Fetched Premium Range Protection successfully",
      payload: [record],
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

// CREATE
export const createPremiumRangeProtectionHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validations.validatePremiumRangeProtectionSchema.parse(req.body);

    const newRecord = await service.createPremiumRangeProtection(
      parsed,
      user.id
    );

    return res.status(201).json({
      status: 1,
      message: "Premium Range Protection created successfully",
      payload: [newRecord],
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

// UPDATE
export const updatePremiumRangeProtectionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validations.validateUpdatePremiumRangeProtectionSchema.parse(
      req.body
    );

    const updated = await service.updatePremiumRangeProtection(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Premium Range Protection updated successfully",
      payload: [updated],
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
