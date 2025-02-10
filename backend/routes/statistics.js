import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getProjectStats,
  getProjectTrends,
  getProjectPerformance,
  getDashboardStats,
  getUserStats
} from '../controllers/StatisticsController.js';
import { User } from '../models/index.js';

const router = express.Router();

// All routes are protected
router.use(verifyToken);

// Get project statistics
router.get('/projects', getProjectStats);

// Get project trends
router.get('/trends', getProjectTrends);

// Get project performance
router.get('/performance', getProjectPerformance);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get user statistics
router.get('/users', getUserStats);

// Get user count
router.get('/users/count', async (req, res) => {
  try {
    const count = await User.count();
    res.json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Failed to get user count' });
  }
});

export default router;
