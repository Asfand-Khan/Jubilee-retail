import { Request, Response } from "express";
import { validateDashboard } from "../validations/dashboardValidations";
import * as services from "../services/dashboardService";
import { AuthRequest } from "../types/types";
import { User } from "@prisma/client";
import { getApiUserByUserId } from "../services/userService";

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/policy-stats
// Description --> Fetch policy stats
export const getPolicyStatsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.policyStatusCardStats(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Policy Stats fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/top-5-products-detail-wise
// Description --> Fetch policy stats
export const getTop5ProductsDetailWiseHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.top5ProductsDetailWise(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Top 5 products detail wise fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/top-5-products-by-product-amount
// Description --> Fetch policy stats
export const getTop5ProductsByProductAmountHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.top5ProductsByProductAmount(
      parsed,
      apiUser?.id
    );
    return res.status(200).json({
      status: 1,
      message: "Top 5 products by product amount fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/top-5-api-users-by-policy-amount
// Description --> Fetch policy stats
export const getTop5ApiUsersByPolicyAmountHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.top5ApiUsersByPolicyAmount(
      parsed,
      apiUser?.id
    );
    return res.status(200).json({
      status: 1,
      message: "Top 5 api users by policy amount fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/monthly-orders-and-policies
// Description --> Fetch policy stats
export const getMonthlyOrdersAndPoliciesHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.monthlyOrdersAndPolicies(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Monthly orders and policies fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/product-share-of-policy-amount-by-amount
// Description --> Fetch policy stats
export const getProductShareOfPolicyAmountByAmountHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.productShareOfPolicyAmountByAmount(
      parsed,
      apiUser?.id
    );
    return res.status(200).json({
      status: 1,
      message: "Product share of policy amount by amount fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/policy-status-breakdown-valid-invalid
// Description --> Fetch policy stats
export const getPolicyStatusBreakdownValidInvalidHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.policyStatusBreakdownValidInvalid(
      parsed,
      apiUser?.id
    );
    return res.status(200).json({
      status: 1,
      message: "Policy status breakdown valid invalid fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/recent-orders
// Description --> Fetch policy stats
export const getRecentOrdersHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.recentOrders(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Recent orders fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/top-5-agents
// Description --> Fetch policy stats
export const getTop5AgentsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.top5Agents(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Top 5 agents fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/top-5-branches
// Description --> Fetch policy stats
export const getTop5BranchesHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.top5Branches(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Top 5 branches fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/coupon-usage
// Description --> Fetch policy stats
export const getCouponUsageHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.couponUsage(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Coupon Usage fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Dashboard
// Method --> POST (Protected)
// Endpoint --> /api/v1/dashboard/payment-mode
// Description --> Fetch policy stats
export const getPaymentModeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.userRecord as User;
    const parsed = validateDashboard.parse(req.body);
    const apiUser = await getApiUserByUserId(user.id);
    const stats = await services.paymentMode(parsed, apiUser?.id);
    return res.status(200).json({
      status: 1,
      message: "Payment mode fetched successfully",
      payload: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
