import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { seedDatabase } from './utils/seeder.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import hackathonRoutes from './routes/hackathonRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Middlewares
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration (supports localhost, custom domain, and Render domains)
const isOriginAllowed = (origin, callback) => {
  if (!origin) return callback(null, true);
  const clientUrlEnv = process.env.CLIENT_URL || '';
  const allowedList = clientUrlEnv.split(',').map((u) => u.trim()).filter(Boolean);

  if (
    allowedList.includes(origin) ||
    allowedList.includes('*') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('.onrender.com') ||
    origin.endsWith('.vercel.app')
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

app.use(
  cors({
    origin: isOriginAllowed,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.resolve('uploads')));

// Health check endpoints (placed before rate limiter so Render probes never get throttled)
app.get(['/health', '/api/v1/health'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    service: 'HackMate API',
    version: '1.0.0',
    database: {
      status: dbState,
      connected: isDbConnected,
      readyState: mongoose.connection.readyState,
      isAtlas: (process.env.MONGODB_URI || '').includes('mongodb+srv://'),
      configured: Boolean(process.env.MONGODB_URI),
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// System route to trigger or refresh demo dataset on demand
app.all(['/system/seed', '/api/v1/system/seed'], async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        code: 'DATABASE_DISCONNECTED',
        message: 'Cannot seed demo data: MongoDB is not connected.',
        hint: 'Please verify MONGODB_URI in your Render Environment Variables and ensure MongoDB Atlas Network Access allows 0.0.0.0/0.',
      });
    }
    const result = await seedDatabase(false);
    res.status(200).json({
      success: true,
      message: 'Demo dataset seeded successfully with all filter variations!',
      result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to seed demo data: ${err.message}`,
    });
  }
});

// Database readiness guard for all /api/v1 routes
app.use('/api/v1', (req, res, next) => {
  // Allow health checks, docs, and system endpoints without DB
  if (req.path === '/health' || req.path === '/docs' || req.path.startsWith('/system/')) {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    const isConnecting = mongoose.connection.readyState === 2;
    return res.status(503).json({
      success: false,
      code: 'DATABASE_DISCONNECTED',
      message: isConnecting
        ? 'Database is currently connecting. Please wait a few seconds and try again.'
        : 'Backend database is offline. If deployed on Render, please verify that MONGODB_URI is configured in Render Environment Variables and that MongoDB Atlas allows IP 0.0.0.0/0 (Network Access).',
      troubleshooting: {
        step1: 'Log into cloud.mongodb.com and go to Network Access. Ensure 0.0.0.0/0 (Allow Access from Anywhere) is active.',
        step2: 'Log into dashboard.render.com -> HackMate API Web Service -> Environment.',
        step3: 'Ensure MONGODB_URI is set to your MongoDB Atlas connection string (mongodb+srv://...).',
      },
    });
  }
  next();
});

// Apply general API rate limiting to /api/v1
app.use('/api/v1', apiLimiter);

// Interactive API Documentation endpoint
app.get('/api/v1/docs', (req, res) => {
  res.status(200).json({
    name: 'HackMate API Documentation',
    version: 'v1',
    description: 'REST API endpoints for HackMate — Real-Time Hackathon Team Finder',
    endpoints: {
      auth: {
        'POST /api/v1/auth/register': 'Register a new user account',
        'POST /api/v1/auth/login': 'Authenticate user & receive JWT token',
        'POST /api/v1/auth/social-login': 'Authenticate user via Google or GitHub OAuth profile',
        'GET /api/v1/auth/me': 'Get current authenticated user profile',
        'PUT /api/v1/auth/profile': 'Update current user profile and skills',
        'POST /api/v1/auth/forgot-password': 'Request password reset email',
        'POST /api/v1/auth/reset-password/:token': 'Reset password with token',
        'POST /api/v1/auth/logout': 'End user session and update presence',
      },
      users: {
        'GET /api/v1/users': 'Discover teammates with filtering, search & compatibility',
        'GET /api/v1/users/recommendations': 'Get AI/Smart-matched teammate recommendations',
        'GET /api/v1/users/:id': 'Get public user profile & compatibility breakdown',
      },
      connections: {
        'POST /api/v1/connections/request': 'Send teammate connection request',
        'GET /api/v1/connections/requests': 'Get pending incoming & outgoing requests',
        'PUT /api/v1/connections/requests/:id': 'Accept or reject teammate request',
        'GET /api/v1/connections': 'Get list of accepted connections',
      },
      teams: {
        'POST /api/v1/teams': 'Create a new hackathon team with roles and requirements',
        'GET /api/v1/teams': 'Browse and filter teams looking for members',
        'GET /api/v1/teams/my-teams': 'Get teams where the current user is a member/leader',
        'GET /api/v1/teams/:id': 'Get team details, members, and workspace info',
        'POST /api/v1/teams/:id/apply': 'Apply to join an open team position',
        'POST /api/v1/teams/:id/invite': 'Invite a connected user to the team',
        'POST /api/v1/teams/join-code': 'Join a team using a shareable invite code',
      },
      hackathons: {
        'GET /api/v1/hackathons': 'List hackathons with format, domain, and deadline filters',
        'GET /api/v1/hackathons/featured': 'Get featured upcoming hackathons',
        'GET /api/v1/hackathons/:id': 'Get hackathon details and registered teams',
      },
      chat: {
        'GET /api/v1/chat/conversations': 'Get user conversations with unread counts',
        'GET /api/v1/chat/conversations/:id/messages': 'Get paginated conversation messages',
        'POST /api/v1/chat/conversations/:id/messages': 'Send message with optional file attachment',
      },
      tasks: {
        'GET /api/v1/tasks/team/:teamId': 'Get team Kanban board tasks',
        'POST /api/v1/tasks/team/:teamId': 'Create a new team task',
        'PUT /api/v1/tasks/:taskId': 'Update task status, priority, or assignee',
      },
      admin: {
        'GET /api/v1/admin/stats': 'Platform metrics, trends, and overview',
        'GET /api/v1/admin/users': 'Admin user management',
        'PUT /api/v1/admin/users/:userId/status': 'Suspend or activate user account',
      },
    },
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/hackathons', hackathonRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Serve built frontend assets if present (Monolith / Single Web Service mode on Render)
const clientDistCandidates = [
  path.resolve('../client/dist'),
  path.resolve('client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];
const clientDistPath = clientDistCandidates.find((dir) => fs.existsSync(dir));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Route handler for unhandled API calls
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on path ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
