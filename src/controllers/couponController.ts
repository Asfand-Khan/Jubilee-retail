import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import * as service from "../services/couponService";
import * as validations from "../validations/couponValidations";
import { handleAppError } from "../utils/appErrorHandler";

// GET all
export const getAllCouponsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateCouponListingSchema.parse(req.body);
    const records = await service.getAllCoupons(parsed);
    return res.status(200).json({
      status: 1,
      message: "Fetched all coupons successfully",
      payload: records,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// GET one
export const getCouponHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = validations.validateGetCouponSchema.parse(req.body);

    const record = await service.getCoupon(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Fetched Premium Range Protection successfully",
      payload: [record],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// CREATE
export const createCouponHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validations.validateCouponSchema.parse(req.body);

    const ifExists = await service.couponByCode(parsed.code);
    if (ifExists) {
      return res.status(400).json({
        status: 0,
        message: "Coupon code already exists",
        payload: [],
      });
    }

    const newRecord = await service.createCoupon(parsed, user.id);

    return res.status(201).json({
      status: 1,
      message: "Coupon created successfully",
      payload: [newRecord],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// UPDATE
// export const updatePremiumRangeProtectionHandler = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const parsedData =
//       validations.validateUpdatePremiumRangeProtectionSchema.parse(req.body);

//     const updated = await service.updatePremiumRangeProtection(parsedData);

//     return res.status(200).json({
//       status: 1,
//       message: "Premium Range Protection updated successfully",
//       payload: [updated],
//     });
//   } catch (error) {
//     const err = handleAppError(error);
//     return res.status(err.status).json({
//       status: 0,
//       message: err.message,
//       payload: [],
//     });
//   }
// };
