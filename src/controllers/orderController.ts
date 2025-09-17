import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import * as service from "../services/orderService";
import * as service2 from "../services/orderService2";
import * as validations from "../validations/orderValidations";
import { handleAppError } from "../utils/appErrorHandler";
import { calculateAge } from "../utils/calculateAge";

// CREATE
export const createOrderHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validations.validateOrderSchema.parse(req.body);

    if (parsed.coupon_id && parsed.discount_amount === "0.00") {
      return res.status(400).json({
        status: 0,
        message: "Discount amount is required",
        payload: [],
      });
    }

    const hasCustomer = parsed.customer_details.some(
      (c) => c.type === "customer"
    );
    if (!hasCustomer) {
      return res.status(400).json({
        status: 0,
        message: "At least one customer detail must have type 'customer'.",
        payload: [],
      });
    }

    // 2. Ensure all "customer" entries have required fields
    const invalidCustomer = parsed.customer_details.some((c) => {
      if (c.type === "customer") {
        // check required fields
        const missingFields =
          !c.insurance_name ||
          !c.insurance_dob ||
          !c.insurance_cnic ||
          !c.insurance_cnic_issue_date ||
          !c.insurance_email ||
          !c.insurance_mobile;

        if (missingFields) {
          return true;
        }

        // check age
        const age = calculateAge(c.insurance_dob);
        if (age < 18) {
          return true;
        }
      }
      return false;
    });

    if (invalidCustomer) {
      return res.status(400).json({
        status: 0,
        message:
          "Customer details are required for type 'customer'. Must include all fields and age must be 18 or above.",
        payload: [],
      });
    }

    const newRecord = await service2.createOrder(parsed, user.id);

    return res.status(201).json({
      status: 1,
      message: "Order created successfully",
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

export const ccTransactionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateCCTransactionSchema.parse(req.body);

    const newRecord = await service.ccTransaction(parsed);

    return res.status(200).json({
      status: 1,
      message: "CC Transaction verified successfully",
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
