import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import redis from '../config/redis';

export interface AuthRequest extends Request {
  user: {
    id: string;
    role: string;
    email: string;
  };
}

/**
 * Middleware to verify JWT token and extract user
 */
const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  try {
    const authHeader = authReq.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error('Malformed authentication token');
    }

    // Check if token is blacklisted in Redis (for logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new Error('Token is blacklisted, please login again');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = decoded; // { id, role, email }
    next();
  } catch (error: any) {
    logger.error('Auth authentication failed:', error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};

export default auth;
