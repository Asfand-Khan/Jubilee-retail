import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  createProductCategory,
  getAllProductCategories,
  getProductCategoryByCategoryId,
  getProductCategoryByProductIGISCode,
  updateProductCategoryById,
} from "../services/productCategoryService";
import { validateProductCategoryCreate, validateProductCategoryUpdate } from "../validations/productCategoryValidations";

// Module --> Product Category
// Method --> GET (Protected)
// Endpoint --> /api/v1/product-categories
// Description --> Fetch all product categories
export const getAllProductCategoriesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allProductCategories = await getAllProductCategories();
    return res.status(200).json({
      status: 1,
      message: "Product Categories fetched successfully",
      payload: allProductCategories,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Product Category
// Method --> POST (Protected)
// Endpoint --> /api/v1/product-categories
// Description --> create product category
export const createProductCategoryHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateProductCategoryCreate.parse(req.body);

    const productCategoryByProductIGISCode =
      await getProductCategoryByProductIGISCode(parsedData.igis_product_code);

    if (productCategoryByProductIGISCode) {
      return res.status(400).json({
        status: 0,
        message: "Product Category with IGIS code already exists",
        payload: [],
      });
    }

    const newProductCategory = await createProductCategory(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Product Category created successfully",
      payload: [newProductCategory],
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

// Module --> Product Category
// Method --> POST (Protected)
// Endpoint --> /api/v1/product-categories/single
// Description --> Fetch single product categories
export const getSingleProductCategoryHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const productCategoryId = parseInt(req.body.id);

    if (isNaN(productCategoryId) || productCategoryId <= 0) {
      throw new Error("Invalid product category id");
    }

    const singleCategory = await getProductCategoryByCategoryId(productCategoryId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single product category successfully",
      payload: [singleCategory],
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

// Module --> Product Category
// Method --> PUT (Protected)
// Endpoint --> /api/v1/product-categories
// Description --> Update product categories
export const updateProductCategoryHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateProductCategoryUpdate.parse(req.body);

    const updatedCategory = await updateProductCategoryById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated Product Category successfully",
      payload: [updatedCategory],
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
