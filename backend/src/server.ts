import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db';
import User from './models/User';
import errorHandler from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import { runSeed } from './config/db_seed';

// Route Imports
import authRoutes from './routes/auth';
import masterRoutes from './routes/masters';
import applicantRoutes from './routes/applicants';
import dashboardRoutes from './routes/dashboard';

// Connect to Database
connectDB().then(async () => {
  // Auto-seed for Render Free Tier (if database is empty)
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Database empty, performing auto-seed...');
      await runSeed();
    }
  } catch (error: any) {
    logger.error(`Auto-seed check failed: ${error.message}`);
  }
});

const app = express();

// 1. CORS - MUST be first to handle Preflight (OPTIONS) requests
app.use(cors({
  origin: (origin, callback) => {
    // If CLIENT_URL is defined, only it can access. Otherwise, we allow for now.
    if (!origin) return callback(null, true);
    if (process.env.CLIENT_URL && origin.includes(process.env.CLIENT_URL)) {
      return callback(null, true);
    }
    // Reflect origin to handle browser requirements for credentials
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Security Middlewares
app.use(helmet());
app.use(generalLimiter);
app.use(express.json({ limit: '10kb' }));
// Express 5 makes req.query a getter, so we sanitize body and params manually
app.use((req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body, {});
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params, {});
  }
  next();
});

// HTTP Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
}

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, status: 'API is working' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Master Setup Routes
app.use('/api/masters', masterRoutes);

// Applicant Management Routes
app.use('/api/applicants', applicantRoutes);

// Dashboard Routes
app.use('/api/dashboard', dashboardRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
});
