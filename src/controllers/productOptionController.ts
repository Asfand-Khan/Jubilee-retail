import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  getPlanByPlanName,
  updatePlanById,
} from "../services/planService";
import {
  validatePlanCreate,
  validatePlanUpdate,
} from "../validations/planValidations";
import {
  createProductOption,
  getAllProductOptions,
  getProductOptionById,
  updateProductOptionById,
} from "../services/productOptionService";
import {
  validateProductOptionCreate,
  validateProductOptionUpdate,
} from "../validations/productOptionValidations";

// Module --> Product Option
// Method --> GET (Protected)
// Endpoint --> /api/v1/product-options
// Description --> Fetch all product options
export const getAllProductOptionsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const result = await getAllProductOptions();
    return res.status(200).json({
      status: 1,
      message: "All product options fetched successfully",
      payload: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Product Option
// Method --> POST (Protected)
// Endpoint --> /api/v1/product-options
// Description --> Create product options
export const createProductOptionHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateProductOptionCreate.parse(req.body);

    const newProductOption = await createProductOption(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Product option created successfully",
      payload: [newProductOption],
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

// Module --> Product Option
// Method --> POST (Protected)
// Endpoint --> /api/v1/product-options/single
// Description --> Get single product options
export const getSingleProductOptionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const product_option_id = parseInt(req.body.id);

    if (isNaN(product_option_id) || product_option_id <= 0) {
      throw new Error("Invalid product option id");
    }

    const singleProductOption = await getProductOptionById(product_option_id);

    return res.status(200).json({
      status: 1,
      message: "Fetched single product option successfully",
      payload: [singleProductOption],
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

// Module --> Product Option
// Method --> PUT (Protected)
// Endpoint --> /api/v1/product-options/
// Description --> Update product options
export const updateProductOptionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateProductOptionUpdate.parse(req.body);

    const updatedProductOption = await updateProductOptionById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated product option successfully",
      payload: [updatedProductOption],
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
