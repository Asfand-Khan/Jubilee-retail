import { Request, Response } from "express";
import {
  createBranch,
  getAllBranches,
  getBranchByHISBranchCode,
  getBranchByHISTakafulCode,
  getBranchById,
  getBranchByIGISBranchCode,
  getBranchByIGISTakafulCode,
  updateBranchById,
} from "../services/branchService";
import { validateBranchCreate, validateBranchUpdate } from "../validations/branchValidations";
import { z } from "zod";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";

// Module --> Branch
// Method --> GET (Protected)
// Endpoint --> /api/v1/branches
// Description --> Fetch all branches
export const getAllBranchesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const branches = await getAllBranches();
    return res.status(200).json({
      status: 1,
      message: "Branches fetched successfully",
      payload: branches,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Branch
// Method --> POST (Protected)
// Endpoint --> /api/v1/branches
// Description --> Create branch
export const createBranchHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsedBranch = validateBranchCreate.parse(req.body);

    const branchByBranchCode = await getBranchByIGISBranchCode(
      parsedBranch.igis_branch_code
    );

    if (branchByBranchCode) {
      return res.status(400).json({
        status: 0,
        message: "Branch with this branch code already exists",
        payload: [],
      });
    }

    const branchByTakafulCode = await getBranchByIGISTakafulCode(
      parsedBranch.igis_takaful_code
    );
    if (branchByTakafulCode) {
      return res.status(400).json({
        status: 0,
        message: "Branch with this takaful code already exists",
        payload: [],
      });
    }

    const branchByHISBranchCode = await getBranchByHISBranchCode(
      parsedBranch.his_code
    );
    if (branchByHISBranchCode) {
      return res.status(400).json({
        status: 0,
        message: "Branch with this HIS branch code already exists",
        payload: [],
      });
    }

    const branchByHISTakafulCode = await getBranchByHISTakafulCode(
      parsedBranch.his_code_takaful
    );
    if (branchByHISTakafulCode) {
      return res.status(400).json({
        status: 0,
        message: "Branch with this HIS takaful code already exists",
        payload: [],
      });
    }

    const newBranch = await createBranch(parsedBranch, user.id);

    return res.status(201).json({
      status: 1,
      message: "Branch created successfully",
      payload: [newBranch],
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

// Module --> Branch
// Method --> GET (Protected)
// Endpoint --> /api/v1/branches/:id
// Description --> Get single branch
export const getSingleBranchHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const branchId = parseInt(req.params.id);

    if (isNaN(branchId) || branchId <= 0) {
      throw new Error("Invalid branch id");
    }

    const singleBranch = await getBranchById(branchId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single branch successfully",
      payload: [singleBranch],
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

// Module --> Branch
// Method --> PUT (Protected)
// Endpoint --> /api/v1/branches/
// Description --> Update branch
export const updateBranchHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedBranch = validateBranchUpdate.parse(req.body);

    const updatedBranch = await updateBranchById(parsedBranch);

    return res.status(200).json({
      status: 1,
      message: "Updated branch successfully",
      payload: [updatedBranch],
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