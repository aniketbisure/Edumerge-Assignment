"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Higher-order middleware function to restrict route access based on user role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            logger_1.default.warn(`User ${req.user.id} with role ${userRole} denied access to protected route`);
            return res.status(403).json({
                success: false,
                message: 'No permission to access this resource'
            });
        }
        next();
    };
};
exports.default = authorize;
//# sourceMappingURL=rbac.js.map