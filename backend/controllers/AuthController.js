import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create initials from username or name
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() 
                        : username.substring(0, 2).toUpperCase();

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      name,
      initials
    });

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        name: user.name,
        initials: user.initials
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        initials: user.initials,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Find user
    const user = await User.findOne({ 
      where: { 
        email,
        status: 'Active'  // Only allow active users to login
      } 
    });

    if (!user) {
      console.log('User not found or inactive:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token with additional user info
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        name: user.name,
        initials: user.initials
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        initials: user.initials,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};
