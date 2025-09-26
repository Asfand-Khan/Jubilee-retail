import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { handleAppError } from "../utils/appErrorHandler";
import {
  createApiUserProduct,
  getAllApiUserProducts,
  getSingleApiUserProducts,
  updateApiUserProduct,
} from "../services/apiUserProductService";
import {
  validateApiUserProductSchema,
  validateSingleApiUserProductSchema,
} from "../validations/apiUserProductValidations";

// Module --> Api-User Product
// Method --> GET (Protected)
// Endpoint --> /api/v1/api-user-products
// Description --> All Api User Product
export const getAllApiUserProductHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const apiUserProducts = await getAllApiUserProducts();
    return res.status(200).json({
      status: 1,
      message: "All API User Product fetched successfully",
      payload: apiUserProducts,
    });
  } catch (error: any) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Api-User Product
// Method --> POST (Protected)
// Endpoint --> /api/v1/api-user-products/single
// Description --> Single Api User Product
export const singleApiUserProductHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validateSingleApiUserProductSchema.parse(req.body);
    const apiUserProducts = await getSingleApiUserProducts(
      parsedData.api_user_id
    );

    if (apiUserProducts.length === 0) {
      return res.status(400).json({
        status: 0,
        message: "No API User Products found for the given API User ID",
        payload: [],
      })
    }
    
    return res.status(200).json({
      status: 1,
      message: "Single API User Product fetched successfully",
      payload: apiUserProducts,
    });
  } catch (error: any) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Api-User Product
// Method --> POST (Protected)
// Endpoint --> /api/v1/api-user-products
// Description --> Create Api User Product
export const createApiUserProductHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateApiUserProductSchema.parse(req.body);
    const apiUserProducts = await createApiUserProduct(parsedData, user.id);
    return res.status(201).json({
      status: 1,
      message: "API User Product created successfully",
      payload: apiUserProducts,
    });
  } catch (error: any) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Api-User Product
// Method --> PUT (Protected)
// Endpoint --> /api/v1/api-user-products
// Description --> Update Api User Product
export const updateApiUserProductHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedData = validateApiUserProductSchema.parse(req.body);
    const apiUserProducts = await updateApiUserProduct(parsedData, user.id);
    return res.status(200).json({
      status: 1,
      message: "API User Product updated successfully",
      payload: apiUserProducts,
    });
  } catch (error: any) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
