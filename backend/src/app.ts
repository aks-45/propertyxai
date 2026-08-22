import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables before importing other modules
dotenv.config();

import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import propertyRoutes from './routes/property.routes';
import analysisRoutes from './routes/analysis.routes';
import locationRoutes from './routes/location.routes';
import governmentRoutes from './routes/government.routes';
import prisma from './config/database';

const app: Express = express();
const port = Number(process.env.PORT) || 5001;

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Allow CORS for all local LAN devices, localhost, and deployed domains (including Render)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or any LAN/Render/local origin
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('onrender.com') ||
      origin.includes('vercel.app') ||
      origin.includes('172.') ||
      origin.includes('192.168.') ||
      origin.includes('10.')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for production deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    name: 'Property X AI Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      profile: '/api/profile',
      properties: '/api/properties',
      analyses: '/api/analyses',
      location: '/api/location',
      government: '/api/government/guide',
    },
    frontendUrl: 'http://localhost:3000',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Property X AI Backend is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount domain routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/government-guide', governmentRoutes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully (SIGINT)...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully (SIGTERM)...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start listening if not running in a test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Property X AI Backend server running on http://0.0.0.0:${port}`);
  });
}

export default app;