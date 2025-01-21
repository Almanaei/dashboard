import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import projectRoutes from './routes/projects.js';
import statisticsRoutes from './routes/statistics.js';
import reportsRoutes from './routes/reports.js';
import { Op } from 'sequelize';
import User from './models/User.js';
import Project from './models/Project.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/reports', reportsRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Dashboard API' });
});

// Start server and initialize database
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    console.log('Database connection has been established successfully.');
    
    // Sync database models
    await User.sync();
    await Project.sync();
    
    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
