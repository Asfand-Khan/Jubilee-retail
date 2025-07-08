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
import { createIgisSubMake, getAllIgisSubMakes, getIgisSubMakeById, getIgisSubMakeByIgisSubMakeCode, updateIgisSubMake } from "../services/igisSubMakeService";
import { validateIgisSubMake, validateIgisSubMakeUpdate } from "../validations/igisSubMakeValidations";

// Module --> Igis Sub Makes
// Method --> GET (Protected)
// Endpoint --> /api/v1/igis-sub-makes
// Description --> Fetch all igis sub makes
export const getAllIgisSubMakesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const igisSubMakes = await getAllIgisSubMakes();
    return res.status(200).json({
      status: 1,
      message: "Igis Sub Makes fetched successfully",
      payload: igisSubMakes,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Igis Sub Makes
// Method --> POST (Protected)
// Endpoint --> /api/v1/igis-sub-makes
// Description --> Create Igis Sub Make
export const createIgisSubMakeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedIgisSubMake = validateIgisSubMake.parse(req.body);

    const igisSubMakeByIgisSubMakeCode = await getIgisSubMakeByIgisSubMakeCode(
      parsedIgisSubMake.igis_sub_make_code
    );

    if (igisSubMakeByIgisSubMakeCode) {
      return res.status(400).json({
        status: 0,
        message: "Igis Sub Make with this igis make code already exists",
        payload: [],
      });
    }

    const newIgisSubMake = await createIgisSubMake(parsedIgisSubMake, user.id);

    return res.status(201).json({
      status: 1,
      message: "Igis Sub Make created successfully",
      payload: [newIgisSubMake],
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

// Module --> Igis Sub Make
// Method --> GET (Protected)
// Endpoint --> /api/v1/igis-sub-makes/:id
// Description --> Get single igis sub make
export const getSingleIgisSubMakeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const igisSubMakeId = parseInt(req.params.id);

    if (isNaN(igisSubMakeId) || igisSubMakeId <= 0) {
      throw new Error("Invalid igis sub make id");
    }

    const singleIgisSubMake = await getIgisSubMakeById(igisSubMakeId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single igis  sub make successfully",
      payload: [singleIgisSubMake],
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

// Module --> Igis Sub Make
// Method --> PUT (Protected)
// Endpoint --> /api/v1/igis-sub-makes/
// Description --> Update igis sub make
export const updateIgisSubMakeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedIgisSubMake = validateIgisSubMakeUpdate.parse(req.body);

    const updatedIgisSubMake = await updateIgisSubMake(parsedIgisSubMake);

    return res.status(200).json({
      status: 1,
      message: "Updated igis sub make successfully",
      payload: [updatedIgisSubMake],
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
