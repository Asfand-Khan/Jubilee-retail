import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  createProductType,
  getAllProductTypes,
  getProductTypeById,
  updateProductTypeById,
} from "../services/productTypeService";
import {
  validateProductTypeCreate,
  validateProductTypeUpdate,
} from "../validations/productTypeValidations";

// Module --> Product Type
// Method --> GET (Protected)
// Endpoint --> /api/v1/product-types
// Description --> Fetch all product types
export const getAllProductTypesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allProductTypes = await getAllProductTypes();
    return res.status(200).json({
      status: 1,
      message: "Product types fetched successfully",
      payload: allProductTypes,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Product Type
// Method --> POST (Protected)
// Endpoint --> /api/v1/product-types
// Description --> Create product type
export const createProductTypeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateProductTypeCreate.parse(req.body);

    const newProductType = await createProductType(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Product Type created successfully",
      payload: [newProductType],
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

// Module --> Product Type
// Method --> POST (Protected)
// Endpoint --> /api/v1/product-types/single
// Description --> Get single product type
export const getSingleProductTypeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const productTypeId = parseInt(req.body.id);

    if (isNaN(productTypeId) || productTypeId <= 0) {
      throw new Error("Invalid product type id");
    }

    const singleProductType = await getProductTypeById(productTypeId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single product type successfully",
      payload: [singleProductType],
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

// Module --> Product Type
// Method --> PUT (Protected)
// Endpoint --> /api/v1/product-types/
// Description --> Update product type
export const updateProductTypeHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateProductTypeUpdate.parse(req.body);

    const updatedProductType = await updateProductTypeById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated product type successfully",
      payload: [updatedProductType],
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
