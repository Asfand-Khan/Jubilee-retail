import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { ApiUser, User } from "@prisma/client";
import * as service from "../services/orderService";
import * as service2 from "../services/orderService2";
import * as validations from "../validations/orderValidations";
import { handleAppError } from "../utils/appErrorHandler";
import { calculateAge } from "../utils/calculateAge";
import { sendSms } from "../utils/sendSms";
import { sendEmail } from "../utils/sendEmail";
import { getOrderCODTemplate } from "../utils/getOrderB2BTemplate";
import { bulkOrderSchema } from "../validations/bulkOrderValidations";
import { getApiUserByUserId } from "../services/userService";

// CREATE
export const createOrderHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as ApiUser;
    console.log(user);
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

    const newRecord = await service2.createOrder(
      parsed,
      user.user_id,
      req,
      user.id
    );

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

// UPDATE
export const updateOrderHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateOrderUpdateSchema.parse(req.body);
    const newRecord = await service2.updateOrder(parsed);

    return res.status(200).json({
      status: 1,
      message: "Order updated successfully",
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

export const manuallyVerifyCCHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateCCTransactionSchema.parse(req.body);

    const newRecord = await service.manuallyVerifyCC(parsed, req);

    return res.status(200).json({
      status: 1,
      message: "Manually verified CC successfully",
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

export const orderPolicyStatusHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateOrderPolicyStatusSchema.parse(req.body);

    const newRecord = await service.orderPolicyStatus(parsed);

    return res.status(200).json({
      status: 1,
      message: "Policy status updated successfully",
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

export const fetchOrderListHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validations.validateListSchema.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const newRecord = await service.orderList(parsed, apiUser?.id);

    return res.status(200).json({
      status: 1,
      message: "List fetched successfully",
      payload: newRecord,
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

export const singleOrderHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateOrderCode.parse(req.body);
    const newRecord = await service.singleOrder(parsed);

    return res.status(200).json({
      status: 1,
      message: "Single order fetched successfully",
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

export const repushOrderHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateOrderCode.parse(req.body);
    const newRecord = await service.repushOrder(parsed);

    return res.status(200).json({
      status: 1,
      message: "Order repushed successfully",
      payload: newRecord,
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

export const generateHISHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = validations.validateGenerateHIS.parse(req.body);
    const zipBuffer = await service.generateHIS(parsed);

    const fileName = `his_files_${Date.now()}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.send(zipBuffer);
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

export const bulkOrderHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = bulkOrderSchema.parse(req.body);
    const result = await service.bulkOrder(parsed, user.id, req);

    return res.status(200).json({
      status: 1,
      message: "Bulk order created successfully",
      payload: [{ ...result }],
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
