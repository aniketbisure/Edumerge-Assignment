import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(generalLimiter);
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
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
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

// Master Setup Routes
import masterRoutes from './routes/masters';
app.use('/api/masters', masterRoutes);

// Applicant Management Routes
import applicantRoutes from './routes/applicants';
app.use('/api/applicants', applicantRoutes);

// Dashboard Routes
import dashboardRoutes from './routes/dashboard';
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
