import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import {
  createCallUsData,
  getAllCallUsData,
  getCallUsDataById,
  updateCallUsData,
} from "../services/callUsDataService";
import {
  validateCallUsData,
  validateCallUsDataUpdate,
} from "../validations/calUsDataValidations";

// Module --> Call Us Data
// Method --> GET (Protected)
// Endpoint --> /api/v1/call-us-data
// Description --> Fetch all call us data
export const getAllCallUsDataHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const callUsData = await getAllCallUsData();
    return res.status(200).json({
      status: 1,
      message: "Call us data fetched successfully",
      payload: callUsData,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Call Us Data
// Method --> POST (Protected)
// Endpoint --> /api/v1/call-us-data
// Description --> Create Call Us Data
export const createCallUsDataHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedCallUsData = validateCallUsData.parse(req.body);

    const newCallUsData = await createCallUsData(parsedCallUsData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Call us data created successfully",
      payload: [newCallUsData],
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

// Module --> Call Us Data
// Method --> GET (Protected)
// Endpoint --> /api/v1/call-us-data/:id
// Description --> Get single call us data
export const getSingleCallUsDataHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const callUsDataId = parseInt(req.params.id);

    if (isNaN(callUsDataId) || callUsDataId <= 0) {
      throw new Error("Invalid call us data id");
    }

    const singleCallUsData = await getCallUsDataById(callUsDataId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single call us data successfully",
      payload: [singleCallUsData],
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

// Module --> Call Us Data
// Method --> PUT (Protected)
// Endpoint --> /api/v1/call-us-data/
// Description --> Update call us data
export const updateCallUsDataHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedCallUsData = validateCallUsDataUpdate.parse(req.body);

    const updatedCallUsData = await updateCallUsData(parsedCallUsData);

    return res.status(200).json({
      status: 1,
      message: "Updated call us data successfully",
      payload: [updatedCallUsData],
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
