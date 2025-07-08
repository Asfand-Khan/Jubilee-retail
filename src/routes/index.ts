import { Router } from 'express';
import userRoutes from './userRoutes';
import apiUserRoutes from './apiUserRoutes';
import branchRoutes from './branchRoutes';
import DORoutes from './developmentOfficerRoutes';
import agentRoutes from './agentRoutes';
import clientRoutes from './clientRoutes';
import courierRoutes from './courierRoutes';
import menuRoutes from './menuRoutes';
import cityRoutes from './cityRoutes';
import callUsDataRoutes from './callUsDataRoutes';
import businessRegionRoutes from './businessRegionRoutes';
import igisMakeRoutes from './igisMakeRoutes';
import igisSubMakeRoutes from './igisSubMakeRoutes';

const router = Router();

// Mount specific resource routes
router.use('/users', userRoutes);
router.use('/menus', menuRoutes);
router.use('/api-users', apiUserRoutes);
router.use('/branches', branchRoutes);
router.use('/development-officers', DORoutes);
router.use('/agents', agentRoutes);
router.use('/clients', clientRoutes);
router.use('/couriers', courierRoutes);
router.use('/cities', cityRoutes);
router.use('/call-us-data', callUsDataRoutes);
router.use('/business-regions', businessRegionRoutes);
router.use('/igis-makes', igisMakeRoutes);
router.use('/igis-sub-makes', igisSubMakeRoutes);

export default router;
