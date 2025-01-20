import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getProjectStats,
  getProjectTrends,
  getProjectPerformance
} from '../controllers/StatisticsController.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Get project overview statistics
router.get('/projects/overview', getProjectStats);

// Get project trends
router.get('/projects/trends', getProjectTrends);

// Get project performance metrics
router.get('/projects/performance', getProjectPerformance);

export default router;
