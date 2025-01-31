import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getProjectStats,
  getProjectTrends,
  getProjectPerformance,
  getDashboardStats,
  getUserStats
} from '../controllers/StatisticsController.js';

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get user statistics
router.get('/users', getUserStats);

// Get project overview statistics
router.get('/projects/overview', getProjectStats);

// Get project trends
router.get('/projects/trends', getProjectTrends);

// Get project performance metrics
router.get('/projects/performance', getProjectPerformance);

export default router;
