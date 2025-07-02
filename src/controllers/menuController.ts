import { Request, Response } from "express";
import { getAllMenus } from "../services/menuService";

// Module --> Menu
// Method --> GET (Protected)
// Endpoint --> /api/v1/menus
// Description --> Fetch all menus
export const getAllMenusHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const menus = await getAllMenus();
    return res.status(200).json({
      status: 1,
      message: "All menus fetched successfully",
      payload: menus,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};