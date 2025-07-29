import { Request, Response } from "express";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { z } from "zod";
import { createMotorQuote, getAllMotorQuotes, getMotorQuoteById, getMotorQuoteByQuoteId, updateMotorQuote } from "../services/motorQuoteService";
import { validateMotorQuote, validateMotorQuoteUpdate } from "../validations/motorQuoteValidations";

// Module --> Motor Quote
// Method --> GET (Protected)
// Endpoint --> /api/v1/motor-quotes
// Description --> Fetch all motor quotes
export const getAllMotorQuotesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const quotes = await getAllMotorQuotes();
    return res.status(200).json({
      status: 1,
      message: "Motor Quotes fetched successfully",
      payload: quotes ,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Motor Quote
// Method --> POST (Protected)
// Endpoint --> /api/v1/motor-quotes
// Description --> Create Motor Quote
export const createMotorQuoteHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedQuote = validateMotorQuote.parse(req.body);

    const quoteByQuoteId = await getMotorQuoteByQuoteId(
      parsedQuote.quote_id
    );

    if (quoteByQuoteId) {
      return res.status(400).json({
        status: 0,
        message: "Motor Quote with this quote id already exists",
        payload: [],
      });
    }

    const newQuote = await createMotorQuote(parsedQuote, user.id);

    return res.status(201).json({
      status: 1,
      message: "Motor Quote created successfully",
      payload: [newQuote],
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

// Module --> Motor Quote
// Method --> GET (Protected)
// Endpoint --> /api/v1/motor-quotes/:id
// Description --> Get single motor quote
export const getSingleMotorQuoteHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const motorQuoteId = parseInt(req.params.id);

    if (isNaN(motorQuoteId) || motorQuoteId <= 0) {
      throw new Error("Invalid motor quote id");
    }

    const singleQuote = await getMotorQuoteById(motorQuoteId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single quote successfully",
      payload: [singleQuote],
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

// Module --> Motor Quote
// Method --> PUT (Protected)
// Endpoint --> /api/v1/motor-quotes/
// Description --> Update motor quote
export const updateMotorQuoteHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedQuote = validateMotorQuoteUpdate.parse(req.body);

    const updatedQuote = await updateMotorQuote(parsedQuote);

    return res.status(200).json({
      status: 1,
      message: "Updated quote successfully",
      payload: [updatedQuote],
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
