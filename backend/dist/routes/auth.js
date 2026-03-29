"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = __importDefault(require("../middleware/auth"));
const logger_1 = __importDefault(require("../utils/logger"));
const redis_1 = __importDefault(require("../config/redis"));
// Generate tokens
const generateToken = (userId, userRole, email, secret, expiry) => {
    return jsonwebtoken_1.default.sign({ id: userId, role: userRole, email }, secret, { expiresIn: expiry });
};
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        logger_1.default.info(`Login attempt for: ${email}`);
        if (!email || !password) {
            throw new Error('Please provide email and password');
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            logger_1.default.warn(`User not found: ${email}`);
            throw new Error('Invalid email or password');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger_1.default.warn(`Password mismatch for: ${email}`);
            throw new Error('Invalid email or password');
        }
        if (!user.isActive) {
            throw new Error('Your account is inactive. Please contact admin.');
        }
        // Generate accessToken and refreshToken
        const accessToken = generateToken(user._id, user.role, user.email, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '15m');
        const refreshToken = generateToken(user._id, user.role, user.email, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN || '7d');
        res.status(200).json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: { id: user._id, name: user.name, role: user.role, email: user.email }
            }
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger_1.default.error(`Login failed: ${message}`);
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
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = generateToken(decoded.id, decoded.role, decoded.email, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '15m');
        res.status(200).json({
            success: true,
            data: { accessToken }
        });
    }
    catch (error) {
        logger_1.default.error('Token refresh failed:', error.message);
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
});
// Logout user
router.post('/logout', auth_1.default, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) {
            throw new Error('No authorization token found');
        }
        // Blacklist token in Redis (expire after expiry time)
        // For simplicity, blacklist for 1 hour
        await redis_1.default.set(`blacklist:${token}`, '1', 'EX', 3600);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Logout failed:', error.message);
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
});
// Me route
router.get('/me', auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            throw new Error('User not found');
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map