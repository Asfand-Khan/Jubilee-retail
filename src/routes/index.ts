import { Router } from 'express';
import userRoutes from './userRoutes';
import apiUserRoutes from './apiUserRoutes';

const router = Router();

// Mount specific resource routes
router.use('/users', userRoutes);
router.use('/api-users', apiUserRoutes);

export default router;
