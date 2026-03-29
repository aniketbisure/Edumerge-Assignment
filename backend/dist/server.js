"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = __importDefault(require("./utils/logger"));
// Connect to Database
(0, db_1.default)();
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)());
app.use(rateLimiter_1.generalLimiter);
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10kb' }));
// Express 5 makes req.query a getter, so we sanitize body and params manually
app.use((req, res, next) => {
    if (req.body) {
        express_mongo_sanitize_1.default.sanitize(req.body, {});
    }
    if (req.params) {
        express_mongo_sanitize_1.default.sanitize(req.params, {});
    }
    next();
});
// HTTP Request Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.default.info(message.trim()) } }));
}
// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, status: 'API is working' });
});
// Auth Routes
const auth_1 = __importDefault(require("./routes/auth"));
app.use('/api/auth', auth_1.default);
// Master Setup Routes
const masters_1 = __importDefault(require("./routes/masters"));
app.use('/api/masters', masters_1.default);
// Applicant Management Routes
const applicants_1 = __importDefault(require("./routes/applicants"));
app.use('/api/applicants', applicants_1.default);
// Dashboard Routes
const dashboard_1 = __importDefault(require("./routes/dashboard"));
app.use('/api/dashboard', dashboard_1.default);
// Error Handling
app.use(errorHandler_1.default);
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger_1.default.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received. Shutting down gracefully.');
    server.close(() => {
        logger_1.default.info('Process terminated.');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map