import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByProductName,
  updateProductById,
} from "../services/productService";
import {
  validateProductCreate,
  validateProductUpdate,
} from "../validations/productValidations";

// Module --> Product
// Method --> GET (Protected)
// Endpoint --> /api/v1/products
// Description --> Fetch all products
export const getAllProductsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allProducts = await getAllProducts();
    return res.status(200).json({
      status: 1,
      message: "Products fetched successfully",
      payload: allProducts,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Product
// Method --> POST (Protected)
// Endpoint --> /api/v1/products
// Description --> Create products
export const createProductHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateProductCreate.parse(req.body);

    const productByProductName = await getProductByProductName(
      parsedData.product_name
    );

    if (productByProductName) {
      return res.status(400).json({
        status: 0,
        message: "Product with name already exists",
        payload: [],
      });
    }

    const newProduct = await createProduct(parsedData, user.id);

    return res.status(201).json({
      status: 1,
      message: "Product created successfully",
      payload: [newProduct],
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

// Module --> Product
// Method --> POST (Protected)
// Endpoint --> /api/v1/products/single
// Description --> Get single product
export const getSingleProductHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const productId = parseInt(req.body.id);

    if (isNaN(productId) || productId <= 0) {
      throw new Error("Invalid product id");
    }

    const singleProduct = await getProductById(productId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single product successfully",
      payload: [singleProduct],
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

// Module --> Product
// Method --> PUT (Protected)
// Endpoint --> /api/v1/products/
// Description --> Update product
export const updateProductHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateProductUpdate.parse(req.body);

    const updatedProduct = await updateProductById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated product successfully",
      payload: [updatedProduct],
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
