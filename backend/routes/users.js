import express from 'express';
import db, { User } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get user count
router.get('/count', async (req, res) => {
  try {
    const count = await User.count();
    res.json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ message: 'Failed to get user count' });
  }
});

// Get all users with optional search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};
    
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'username', 'role', 'status', 'lastActive', 'avatar'],
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, username, password, role, status } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate avatar URL
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      role,
      status,
      avatar,
      lastActive: new Date()
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, role, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email/username is taken by another user
    const existingUser = await User.findOne({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: id } },
          {
            [Op.or]: [
              { email },
              { username }
            ]
          }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email or username is already taken by another user'
      });
    }

    // Update avatar if name changed
    const avatar = name !== user.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
      : user.avatar;

    await user.update({
      name,
      email,
      username,
      role,
      status,
      avatar
    });

    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'username', 'role', 'status', 'lastActive', 'avatar']
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Update user status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ status });
    
    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'username', 'role', 'status', 'lastActive', 'avatar']
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

export default router;
