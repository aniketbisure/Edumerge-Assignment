import rateLimit from 'express-rate-limit';

// rate-limit-redis v4 is designed for node-redis, not ioredis.
// For local dev without Redis, we simply use the default in-memory store.
// In production, set REDIS_URL and swap in a proper store if needed.
// This prevents the server from crashing when Redis is unavailable.

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Render sets this header; trust proxy handles it
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  }
});

export const seatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many allocation requests, please wait a minute'
  }
});
