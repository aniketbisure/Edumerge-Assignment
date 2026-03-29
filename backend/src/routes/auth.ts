import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import redis from '../config/redis';

// Generate tokens
const generateToken = (userId: any, userRole: string, email: string, secret: string, expiry: string | number) => {
  return jwt.sign({ id: userId, role: userRole, email }, secret, { expiresIn: expiry as any });
};

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for: ${email}`);

    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn(`User not found: ${email}`);
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Password mismatch for: ${email}`);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Your account is inactive. Please contact admin.');
    }

    // Generate accessToken and refreshToken
    const accessToken = generateToken(user._id, user.role, user.email, process.env.JWT_SECRET as string, process.env.JWT_EXPIRES_IN || '15m');
    const refreshToken = generateToken(user._id, user.role, user.email, process.env.JWT_REFRESH_SECRET as string, process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, role: user.role, email: user.email }
      }
    });

  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Login failed: ${message}`);
    res.status(401).json({ success: false, message: message || 'Login failed' });
  }
});

// Refresh Token route
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
    const accessToken = generateToken(decoded.id, decoded.role, decoded.email, process.env.JWT_SECRET as string, process.env.JWT_EXPIRES_IN || '15m');

    res.status(200).json({
      success: true,
      data: { accessToken }
    });

  } catch (error: any) {
    logger.error('Token refresh failed:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new Error('No authorization token found');
    }

    // Blacklist token in Redis (expire after expiry time)
    // For simplicity, blacklist for 1 hour
    await redis.set(`blacklist:${token}`, '1', 'EX', 3600);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    logger.error('Logout failed:', error.message);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// Me route
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new Error('User not found');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
