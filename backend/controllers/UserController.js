import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      raw: true,
      nest: true,
      attributes: {
        include: [
          'id',
          'name',
          'username',
          'email',
          'initials',
          'role',
          'status',
          ['last_login', 'lastLogin'],
          'avatar',
          ['created_at', 'createdAt'],
          ['updated_at', 'updatedAt']
        ],
        exclude: ['password']
      },
      order: [
        [sequelize.col('last_login'), 'DESC'],
        [sequelize.col('created_at'), 'DESC']
      ]
    });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { 
        email 
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user with hashed password
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user',
      name,
      lastLogin: new Date()
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, status, name } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by model hooks
    if (role) user.role = role;
    if (status) user.status = status;
    if (name) {
      user.name = name;
      // Update initials when name changes
      user.initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    await user.save();

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = status;
    await user.save();

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};
