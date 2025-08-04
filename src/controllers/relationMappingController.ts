import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  createRelationMapping,
  getAllRelationMappings,
  getRelationMappingById,
  updateRelationMappingById,
} from "../services/relationMappingService";
import {
  validateRelationMappingCreate,
  validateRelationMappingUpdate,
} from "../validations/relationMappingValidations";

// Module --> Relation Mapping
// Method --> GET (Protected)
// Endpoint --> /api/v1/relation-mappings
// Description --> Fetch all relation mapping
export const getAllRelationMappingsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allRelationMappings = await getAllRelationMappings();
    return res.status(200).json({
      status: 1,
      message: "Relation mappings fetched successfully",
      payload: allRelationMappings,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Relation Mappings
// Method --> POST (Protected)
// Endpoint --> /api/v1/relation-mappings
// Description --> Create relation mappings
export const createRelationMappingHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateRelationMappingCreate.parse(req.body);

    const newRelationMapping = await createRelationMapping(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Relation Mapping created successfully",
      payload: [newRelationMapping],
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

// Module --> Relation Mappings
// Method --> POST (Protected)
// Endpoint --> /api/v1/relation-mappings/single
// Description --> Get single relation mappings
export const getSingleRelationMappingHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const relationMappingId = parseInt(req.body.id);

    if (isNaN(relationMappingId) || relationMappingId <= 0) {
      throw new Error("Invalid relation mapping id");
    }

    const singleRelationMapping = await getRelationMappingById(
      relationMappingId
    );

    return res.status(200).json({
      status: 1,
      message: "Fetched single relation mapping successfully",
      payload: [singleRelationMapping],
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

// Module --> Relation Mapping
// Method --> PUT (Protected)
// Endpoint --> /api/v1/relation-mappings/
// Description --> Update relation mapping
export const updateRelationMappingHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateRelationMappingUpdate.parse(req.body);

    const updatedRelationMapping = await updateRelationMappingById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated relation mapping successfully",
      payload: [updatedRelationMapping],
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
