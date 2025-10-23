import { Router } from "express";
import userRoutes from "./userRoutes";
import apiUserRoutes from "./apiUserRoutes";
import branchRoutes from "./branchRoutes";
import DORoutes from "./developmentOfficerRoutes";
import agentRoutes from "./agentRoutes";
import clientRoutes from "./clientRoutes";
import courierRoutes from "./courierRoutes";
import menuRoutes from "./menuRoutes";
import cityRoutes from "./cityRoutes";
import callUsDataRoutes from "./callUsDataRoutes";
import businessRegionRoutes from "./businessRegionRoutes";
import igisMakeRoutes from "./igisMakeRoutes";
import igisSubMakeRoutes from "./igisSubMakeRoutes";
import motorQuoteRoutes from "./motorQuoteRoutes";
import planRoutes from "./planRoutes";
import productCategoryRoutes from "./productCategoryRoutes";
import productRoutes from "./productRoutes";
import productOptionRoutes from "./productOptionRoutes";
import productTypeRoutes from "./productTypeRoutes";
import relationMappingRoutes from "./relationMappingRoutes";
import webAppMapperRoutes from "./webAppMapperRoutes";
import leadInfoRoutes from "./leadInfoRoutes";
import leadMotorInfoRoutes from "./leadMotorInfoRoutes";
import apiUserProductRoutes from "./apiUserProductRoutes";
import paymentModeRoutes from "./paymentModeRoutes";
import premiumRangeProtectionRoutes from "./premiumRangeProtectionRoutes";
import couponRoutes from "./couponRoutes";
import orderRoutes from "./orderRoutes";
import commonRoutes from "./commonRoutes";
import communicationLogRoutes from "./communicationRoutes";
import reportingRoutes from "./reportingRoutes";

const router = Router();

// Mount specific resource routes
router.use("/users", userRoutes);
router.use("/menus", menuRoutes);
router.use("/api-users", apiUserRoutes);
router.use("/branches", branchRoutes);
router.use("/development-officers", DORoutes);
router.use("/agents", agentRoutes);
router.use("/clients", clientRoutes);
router.use("/couriers", courierRoutes);
router.use("/cities", cityRoutes);
router.use("/call-us-data", callUsDataRoutes);
router.use("/business-regions", businessRegionRoutes);
router.use("/igis-makes", igisMakeRoutes);
router.use("/igis-sub-makes", igisSubMakeRoutes);
router.use("/motor-quotes", motorQuoteRoutes);
router.use("/plans", planRoutes);
router.use("/product-categories", productCategoryRoutes);
router.use("/products", productRoutes);
router.use("/product-options", productOptionRoutes);
router.use("/product-types", productTypeRoutes);
router.use("/relation-mappings", relationMappingRoutes);
router.use("/web-app-mappers", webAppMapperRoutes);
router.use("/lead-infos", leadInfoRoutes);
router.use("/lead-motor-infos", leadMotorInfoRoutes);
router.use("/api-user-products", apiUserProductRoutes);
router.use("/payment-modes", paymentModeRoutes);
router.use("/premium-range-protections", premiumRangeProtectionRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/common", commonRoutes);
router.use("/communication-logs", communicationLogRoutes);
router.use("/reportings", reportingRoutes);


// // Handle 404 errors
// router.use((req, res, next) => {
//     const err = new Error("Not Found");
//     err.status = 404;
//     next(err);
// });

export default router;
