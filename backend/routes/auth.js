import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'last_login']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with:', { email, password: '[HIDDEN]' });
    console.log('Request headers:', req.headers);

    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.scope('withPassword').findOne({ where: { email } });
    console.log('User found:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      hasPassword: !!user.password
    } : 'No user found');

    if (!user || !(await user.validatePassword(password))) {
      console.log('Invalid credentials for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login time
    await user.update({ last_login: new Date() });

    // Create token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful:', {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenGenerated: !!token
    });
    
    // Send response
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: error.message });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'user',
      last_login: new Date()
    });
    
    // Create token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Send response
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
