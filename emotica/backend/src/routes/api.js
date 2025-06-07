import express from 'express';
import authRoutes from './authRoutes.js';
import analysisRoutes from './analysisRoutes.js';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/analysis', analysisRoutes);

export default router;
