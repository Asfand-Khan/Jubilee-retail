import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  createWebAppMapper,
  getAllWebAppMappers,
  getWebAppMapperById,
  updateWebAppMapperById,
} from "../services/webappMapperService";
import {
  validateWebappMapperCreate,
  validateWebappMapperUpdate,
} from "../validations/webappMapperValidations";

// Module --> Web App Mapper
// Method --> GET (Protected)
// Endpoint --> /api/v1/web-app-mappers
// Description --> Fetch all web app mappers
export const getAllWebAppMappersHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allWebAppMappers = await getAllWebAppMappers();
    return res.status(200).json({
      status: 1,
      message: "Web app mappers fetched successfully",
      payload: allWebAppMappers,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Web App Mapper
// Method --> POST (Protected)
// Endpoint --> /api/v1/web-app-mappers
// Description --> Create web app mapper
export const createWebAppMapperHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateWebappMapperCreate.parse(req.body);

    const newWebAppMapper = await createWebAppMapper(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Web App Mapper created successfully",
      payload: [newWebAppMapper],
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

// Module --> Web App Mapper
// Method --> POST (Protected)
// Endpoint --> /api/v1/web-app-mappers/single
// Description --> Get single web app mapper
export const getSingleWebAppMapperHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const webAppMapperId = parseInt(req.body.id);

    if (isNaN(webAppMapperId) || webAppMapperId <= 0) {
      throw new Error("Invalid web app mapper id");
    }

    const singleWebAppMapper = await getWebAppMapperById(webAppMapperId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single web app mapper successfully",
      payload: [singleWebAppMapper],
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

// Module --> Web App Mapper
// Method --> PUT (Protected)
// Endpoint --> /api/v1/web-app-mappers/
// Description --> Update web app mapper
export const updateWebAppMapperHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateWebappMapperUpdate.parse(req.body);

    const updatedWebAppMapper = await updateWebAppMapperById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated web app mapper successfully",
      payload: [updatedWebAppMapper],
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
