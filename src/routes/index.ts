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

export default router;