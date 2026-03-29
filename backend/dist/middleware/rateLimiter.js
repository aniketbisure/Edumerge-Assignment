"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../config/redis');
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Stricter for auth routes
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    }
});
const seatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30, // Block rapid-fire seat locking
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    message: {
        success: false,
        message: 'Too many allocation requests, please wait a minute'
    }
});
module.exports = {
    generalLimiter,
    authLimiter,
    seatLimiter
};
//# sourceMappingURL=rateLimiter.js.map