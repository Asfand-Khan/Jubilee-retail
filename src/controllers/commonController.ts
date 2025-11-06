import { Request, Response } from "express";
import * as services from "../services/commonService";
import { validateCommonDelete } from "../validations/commonValidations";

// Module --> Common
// Method --> POST (Protected)
// Endpoint --> /api/v1/common
// Description --> Soft delete provided module record
export const deleteCommonHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const pasredData = validateCommonDelete.parse(req.body);
    const deleteData = await services.deleteCommon(pasredData);

    return res.status(200).json({
      status: 1,
      message: `${pasredData.module} with ID ${pasredData.record_id} marked as deleted.`,
      payload: deleteData,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};


// Module --> Common
// Method --> POST (Protected)
// Endpoint --> /api/v1/status
// Description --> Toggle status of provided module record
export const toggleStatusCommonHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const pasredData = validateCommonDelete.parse(req.body);
    const deleteData = await services.statusCommon(pasredData);

    console.log("Hello Hello");

    return res.status(200).json({
      status: 1,
      message: `${pasredData.module} with ID ${pasredData.record_id} marked as updated.`,
      payload: deleteData,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
