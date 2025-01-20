import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protected route example
router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: 'Protected route accessed successfully',
    userId: req.user.userId
  });
});

export default router;
