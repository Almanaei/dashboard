import express from 'express';
import db, { User } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const API_URL = process.env.API_URL || 'http://localhost:5005';

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Apply authentication middleware to all routes
router.use(verifyToken);

const attributes = [
  'id',
  'name',
  'username',
  'email',
  'role',
  'status',
  ['last_login', 'lastLogin'],
  'avatar',
  'initials'
];

// Get users with search
router.get('/', async (req, res) => {
  try {
    // Set cache control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');

    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      attributes,
      where,
      order: [['last_login', 'DESC'], ['created_at', 'DESC']]
    });

    // Return users array directly
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

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

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', requireAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, password, role, name, status } = req.body;
    
    console.log('Create user request:', {
      body: req.body,
      file: req.file
    });
    
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

    // Validate role
    const validRoles = ['user', 'admin'];
    const userRole = (role || 'user').toLowerCase();
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        message: 'Invalid role specified'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData = {
      name,
      username,
      email,
      password: hashedPassword,
      role: userRole,
      status: status || 'Active',
      last_login: new Date()
    };

    // Handle avatar if uploaded
    if (req.file) {
      console.log('Processing avatar upload for new user:', req.file);
      // Ensure the path uses forward slashes and remove any leading slashes
      const relativePath = req.file.path.replace(/\\/g, '/').replace(/^uploads\//, '');
      // Store the relative path only
      userData.avatar = relativePath;
      console.log('New avatar path:', relativePath);
    }

    // Create user
    const user = await User.create(userData);
    console.log('Created user:', user.toJSON());

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', requireAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, status, password } = req.body;

    console.log('Update user request:', {
      id,
      body: req.body,
      file: req.file,
      headers: req.headers
    });

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email/username is taken by another user
    if (email || username) {
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: id } },
            {
              [Op.or]: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : [])
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
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['user', 'admin'];
      const userRole = role.toLowerCase();
      if (!validRoles.includes(userRole)) {
        return res.status(400).json({
          message: 'Invalid role specified'
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...(username && { username }),
      ...(email && { email }),
      ...(role && { role: role.toLowerCase() }),
      ...(status && { status }),
      ...(password && { password: await bcrypt.hash(password, 10) }),
      ...(last_login && { last_login: new Date(last_login) })
    };

    // Handle avatar if uploaded
    if (req.file) {
      console.log('Processing avatar upload:', req.file);
      // Delete old avatar file if it exists
      if (user.avatar) {
        const oldAvatarPath = path.join(process.cwd(), 'uploads', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      // Store new avatar path
      const relativePath = req.file.path.replace(/\\/g, '/').replace(/^uploads\//, '');
      updateData.avatar = relativePath;
    } else if (req.body.removeAvatar === 'true') {
      // Handle avatar removal
      if (user.avatar) {
        const avatarPath = path.join(process.cwd(), 'uploads', user.avatar);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      updateData.avatar = null;
    }

    console.log('Updating user with data:', updateData);
    await user.update(updateData);

    const updatedUser = await User.findByPk(id, {
      attributes
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', requireAdmin, async (req, res) => {
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
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ status });
    
    const updatedUser = await User.findByPk(id, {
      attributes
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Update user avatar
router.put('/:id/avatar', requireAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    // Delete old avatar file if it exists and isn't a URL
    if (user.avatar && user.avatar.startsWith('/uploads')) {
      const oldAvatarPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user's avatar path with full URL
    const avatarUrl = API_URL + '/' + req.file.path.replace(/\\/g, '/');
    await user.update({ avatar: avatarUrl });

    const updatedUser = await User.findByPk(id, {
      attributes
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user avatar:', error);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
});

export default router;
