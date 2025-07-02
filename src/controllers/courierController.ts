import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import { createCourier, getAllCouriers, getCourierByAccountNumber, getCourierById, updateCourier } from "../services/courierService";
import { validateCourier, validateCourierUpdate } from "../validations/courierValidations";

// Module --> Courier
// Method --> GET (Protected)
// Endpoint --> /api/v1/couriers
// Description --> Fetch all couriers
export const getAllCouriersHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const couriers = await getAllCouriers();
    return res.status(200).json({
      status: 1,
      message: "Couriers fetched successfully",
      payload: couriers,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Courier
// Method --> POST (Protected)
// Endpoint --> /api/v1/couriers
// Description --> Create Courier
export const createCourierHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedCourier = validateCourier.parse(req.body);

    const courierByAccountNumber = await getCourierByAccountNumber(
      parsedCourier.account_number
    );

    if (courierByAccountNumber) {
      return res.status(400).json({
        status: 0,
        message: "Courier with this account number already exists",
        payload: [],
      });
    }

    const newCourier = await createCourier(parsedCourier, user.id);

    return res.status(201).json({
      status: 1,
      message: "Courier created successfully",
      payload: [newCourier],
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

// Module --> Courier
// Method --> GET (Protected)
// Endpoint --> /api/v1/couriers/:id
// Description --> Get single courier
export const getSingleCourierHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const courierId = parseInt(req.params.id);

    if (isNaN(courierId) || courierId <= 0) {
      throw new Error("Invalid courier id");
    }

    const singleCourier = await getCourierById(courierId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single courier successfully",
      payload: [singleCourier],
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

// Module --> Courier
// Method --> PUT (Protected)
// Endpoint --> /api/v1/couriers/
// Description --> Update courier
export const updateCourierHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedCourier = validateCourierUpdate.parse(req.body);

    const updatedCourier = await updateCourier(parsedCourier);

    return res.status(200).json({
      status: 1,
      message: "Updated courier successfully",
      payload: [updatedCourier],
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