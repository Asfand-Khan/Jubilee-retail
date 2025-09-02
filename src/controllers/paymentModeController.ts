import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { handleAppError } from "../utils/appErrorHandler";
import * as service from "../services/paymentModeService";
import {
  validatePaymentModeSchema,
  validateSinglePaymentModeSchema,
  validateUpdatePaymentModeSchema,
} from "../validations/paymentModesValidations";

// Module --> Payment Mode
// Method --> GET (Protected)
// Endpoint --> /api/v1/payment-modes
// Description --> All Payment Mode
export const getAllPaymentModeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const paymentModes = await service.allPaymentModes();

    return res.status(200).json({
      status: 1,
      message: "All Payment Mode fetched successfully",
      payload: paymentModes,
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

// Module --> Payment Mode
// Method --> POST (Protected)
// Endpoint --> /api/v1/payment-modes
// Description --> Create Payment Mode
export const createPaymentModeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validatePaymentModeSchema.parse(req.body);

    const paymentMode = await service.paymentModeByPaymentCode(
      parsedData.payment_code
    );
    if (paymentMode) {
      return res.status(400).json({
        status: 0,
        message: "Payment Mode already exists",
        payload: [],
      });
    }

    const newPaymentMode = await service.createPaymentMode(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Payment Mode created successfully",
      payload: [newPaymentMode],
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

// Module --> Payment Mode
// Method --> PUT (Protected)
// Endpoint --> /api/v1/paymnent-modes
// Description --> Update Payment Mode
export const updatePaymentModeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateUpdatePaymentModeSchema.parse(req.body);

    const paymentMode = await service.paymentModeByPaymentCode(
      parsedData.payment_code
    );
    if (paymentMode) {
      return res.status(400).json({
        status: 0,
        message: "Payment Mode already exists",
        payload: [],
      });
    }

    const updatedPaymentMode = await service.updatePaymentMode(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Payment Mode updated successfully",
      payload: [updatedPaymentMode],
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

// Module --> Payment Mode
// Method --> POST (Protected)
// Endpoint --> /api/v1/payment-modes/single
// Description --> Single Payment Mode
export const singlePaymentModeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateSinglePaymentModeSchema.parse(req.body);
    const paymentMode = await service.paymentModeById(parsedData);
    return res.status(200).json({
      status: 1,
      message: "Single Payment mode fetched successfully",
      payload: [paymentMode],
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
