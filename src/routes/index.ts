import { Router } from 'express';
import userRoutes from './userRoutes';
import apiUserRoutes from './apiUserRoutes';
import branchRoutes from './branchRoutes';
import DORoutes from './developmentOfficerRoutes';

const router = Router();

// Mount specific resource routes
router.use('/users', userRoutes);
router.use('/api-users', apiUserRoutes);
router.use('/branches', branchRoutes);
router.use('/development-officers', DORoutes);

export default router;
