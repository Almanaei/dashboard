import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import projectRoutes from './routes/projects.js';
import statisticsRoutes from './routes/statistics.js';
import messagesRoutes from './routes/messages.js';
import { verifyToken } from './middleware/authMiddleware.js';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// ES module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3005', process.env.FRONTEND_URL],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  allowEIO3: true,
  allowEIO4: true,
  path: '/socket.io/',
  serveClient: false,
  connectTimeout: 45000,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['polling', 'websocket']
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  try {
    console.log('Socket handshake:', {
      auth: socket.handshake.auth,
      query: socket.handshake.query,
      headers: socket.handshake.headers
    });

    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      console.log('No token provided in handshake');
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log('Socket authenticated for user:', decoded.id);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'User:', socket.user?.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3005', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  if (req.headers.authorization) {
    console.log('Auth token:', req.headers.authorization.substring(0, 50) + '...');
  }
  console.log('Request body:', req.body);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);

// Create Express Router for protected routes
const protectedRoutes = express.Router();

// Apply verifyToken middleware to protected routes
protectedRoutes.use(verifyToken);

// Protected routes
protectedRoutes.use('/users', userRoutes);
protectedRoutes.use('/reports', reportRoutes);
protectedRoutes.use('/projects', projectRoutes);
protectedRoutes.use('/statistics', statisticsRoutes);
protectedRoutes.use('/messages', messagesRoutes);

// Apply protected routes under /api
app.use('/api', protectedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  const port = process.env.PORT || 5005;
  
  const tryPort = (portToTry) => {
    httpServer.listen(portToTry, () => {
      console.log(`Server is running on port ${portToTry}`);
      console.log(`Socket.IO server is ready at path: /socket.io/`);
      console.log('Socket.IO configuration:', io._opts);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${portToTry} is busy, trying ${portToTry + 1}...`);
        tryPort(portToTry + 1);
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    });
  };

  tryPort(port);
};

startServer();

export default app;
