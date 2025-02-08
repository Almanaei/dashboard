import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header:', { authHeader });
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Verifying token:', token.substring(0, 20) + '...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', { userId: decoded.id, role: decoded.role });

    // Check if user exists and is active
    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.log('User not found for token:', decoded.id);
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status !== 'Active') {
      console.log('User account is not active:', { userId: user.id, status: user.status });
      return res.status(401).json({ error: 'Account is not active' });
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      username: decoded.username,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Token verification error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Case insensitive role check
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: error.message });
  }
};
