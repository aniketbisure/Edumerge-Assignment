"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
const redis_1 = __importDefault(require("../config/redis"));
/**
 * Middleware to verify JWT token and extract user
 */
const auth = async (req, res, next) => {
    const authReq = req;
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
        const isBlacklisted = await redis_1.default.get(`blacklist:${token}`);
        if (isBlacklisted) {
            throw new Error('Token is blacklisted, please login again');
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, email }
        next();
    }
    catch (error) {
        logger_1.default.error('Auth authentication failed:', error.message);
        res.status(401).json({ success: false, message: error.message });
    }
};
exports.default = auth;
//# sourceMappingURL=auth.js.map