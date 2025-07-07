import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import {
  createBusinessRegion,
  getAllBusinessRegions,
  getBusinessRegionById,
  getBusinessRegionByIGISBusinessRegionCode,
  updateBusinessRegion,
} from "../services/businessRegionService";
import {
  validateBusinessRegion,
  validateBusinessRegionUpdate,
} from "../validations/businessRegionValidations";

// Module --> Business Regions
// Method --> GET (Protected)
// Endpoint --> /api/v1/business-regions
// Description --> Fetch all business region
export const getAllBusinessRegionsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const businessRegions = await getAllBusinessRegions();
    return res.status(200).json({
      status: 1,
      message: "Business Regions fetched successfully",
      payload: businessRegions,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Business Regions
// Method --> POST (Protected)
// Endpoint --> /api/v1/business-regions
// Description --> Create Business Region
export const createBusinessRegionHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedBusinessRegion = validateBusinessRegion.parse(req.body);

    const businessRegionByBusinessRegionCode =
      await getBusinessRegionByIGISBusinessRegionCode(
        parsedBusinessRegion.igis_business_region_code
      );

    if (businessRegionByBusinessRegionCode) {
      return res.status(400).json({
        status: 0,
        message:
          "Business Region with this business region code already exists",
        payload: [],
      });
    }

    const newBusinessRegion = await createBusinessRegion(
      parsedBusinessRegion,
      user.id
    );

    return res.status(201).json({
      status: 1,
      message: "Business Region created successfully",
      payload: [newBusinessRegion],
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

// Module --> Business Region
// Method --> GET (Protected)
// Endpoint --> /api/v1/business-regions/:id
// Description --> Get single business region
export const getSingleBusinessRegionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const businessRegionId = parseInt(req.params.id);

    if (isNaN(businessRegionId) || businessRegionId <= 0) {
      throw new Error("Invalid business region id");
    }

    const singleBusinessRegion = await getBusinessRegionById(businessRegionId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single business region successfully",
      payload: [singleBusinessRegion],
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

// Module --> Business Region
// Method --> PUT (Protected)
// Endpoint --> /api/v1/business-regions/
// Description --> Update business region
export const updateBusinessRegionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedBusinessRegion = validateBusinessRegionUpdate.parse(req.body);

    const updatedBusinessRegion = await updateBusinessRegion(
      parsedBusinessRegion
    );

    return res.status(200).json({
      status: 1,
      message: "Updated business region successfully",
      payload: [updatedBusinessRegion],
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
