import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import {
  createIgisMake,
  getAllIgisMakes,
  getIgisMakeById,
  getIgisMakeByIgisMakeCode,
  updateIgisMake,
} from "../services/igisMakeService";
import {
  validateIgisMake,
  validateIgisMakeUpdate,
} from "../validations/igisMakeValidations";

// Module --> Igis Makes
// Method --> GET (Protected)
// Endpoint --> /api/v1/igis-makes
// Description --> Fetch all igis makes
export const getAllIgisMakesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const igisMakes = await getAllIgisMakes();
    return res.status(200).json({
      status: 1,
      message: "Igis Makes fetched successfully",
      payload: igisMakes,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Igis Makes
// Method --> POST (Protected)
// Endpoint --> /api/v1/igis-makes
// Description --> Create Igis Make
export const createIgisMakeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedIgisMake = validateIgisMake.parse(req.body);

    const igisMakeByIgisMakeCode = await getIgisMakeByIgisMakeCode(
      parsedIgisMake.igis_make_code
    );

    if (igisMakeByIgisMakeCode) {
      return res.status(400).json({
        status: 0,
        message: "Igis Make with this igis make code already exists",
        payload: [],
      });
    }

    const newIgisMake = await createIgisMake(parsedIgisMake, user.id);

    return res.status(201).json({
      status: 1,
      message: "Igis Make created successfully",
      payload: [newIgisMake],
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

// Module --> Igis Make
// Method --> GET (Protected)
// Endpoint --> /api/v1/igis-makes/:id
// Description --> Get single igis make
export const getSingleIgisMakeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const igisMakeId = parseInt(req.params.id);

    if (isNaN(igisMakeId) || igisMakeId <= 0) {
      throw new Error("Invalid igis make id");
    }

    const singleIgisMake = await getIgisMakeById(igisMakeId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single igis make successfully",
      payload: [singleIgisMake],
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

// Module --> Igis Make
// Method --> PUT (Protected)
// Endpoint --> /api/v1/igis-makes/
// Description --> Update igis make
export const updateIgisMakeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedIgisMake = validateIgisMakeUpdate.parse(req.body);

    const updatedIgisMake = await updateIgisMake(parsedIgisMake);

    return res.status(200).json({
      status: 1,
      message: "Updated igis make successfully",
      payload: [updatedIgisMake],
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
