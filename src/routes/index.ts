import { Router } from 'express';
import userRoutes from './userRoutes';
import apiUserRoutes from './apiUserRoutes';
import branchRoutes from './branchRoutes';
import DORoutes from './developmentOfficerRoutes';
import agentRoutes from './agentRoutes';
import clientRoutes from './clientRoutes';
import courierRoutes from './courierRoutes';
import menuRoutes from './menuRoutes';

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

export default router;
