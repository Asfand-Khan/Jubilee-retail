import { Request, Response } from "express";
import {
  createDO,
  getAllDOs,
  getDOById,
  getDOByIGISDOCode,
  updateDO,
} from "../services/developmentOfficerService";
import { AuthRequest } from "../types/types";
import { validateDevelopmentOfficer, validateDevelopmentOfficerUpdate } from "../validations/developmentOfficerValidations";
import { User } from "@prisma/client";
import { z } from "zod";

// Module --> Development Officer
// Method --> GET (Protected)
// Endpoint --> /api/v1/development-officers
// Description --> Fetch all development officers
export const getAllDOsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const developmentOfficers = await getAllDOs();
    return res.status(200).json({
      status: 1,
      message: "DOs fetched successfully",
      payload: developmentOfficers,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Development Officer
// Method --> POST (Protected)
// Endpoint --> /api/v1/development-officers
// Description --> Create DO
export const createDOHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedDO = validateDevelopmentOfficer.parse(req.body);

    const DOByDOCode = await getDOByIGISDOCode(parsedDO.igis_do_code);

    if (DOByDOCode) {
      return res.status(400).json({
        status: 0,
        message: "Development Officer with this DO code already exists",
        payload: [],
      });
    }

    const newDevelopmentOfficer = await createDO(parsedDO, user.id);

    return res.status(201).json({
      status: 1,
      message: "Development Officer created successfully",
      payload: [newDevelopmentOfficer],
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


// Module --> Development Officer
// Method --> GET (Protected)
// Endpoint --> /api/v1/development-officers/:id
// Description --> Get single development officer
export const getSingleDOHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const DOId = parseInt(req.params.id);

    if (isNaN(DOId) || DOId <= 0) {
      throw new Error("Invalid do id");
    }

    const singleDO = await getDOById(DOId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single DO successfully",
      payload: [singleDO],
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

// Module --> Development Officer
// Method --> PUT (Protected)
// Endpoint --> /api/v1/development-officers/
// Description --> Update development officers
export const updateDOHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedDO = validateDevelopmentOfficerUpdate.parse(req.body);

    const updatedDevelopmentOfficer = await updateDO(parsedDO);

    return res.status(200).json({
      status: 1,
      message: "Updated development officer successfully",
      payload: [updatedDevelopmentOfficer],
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