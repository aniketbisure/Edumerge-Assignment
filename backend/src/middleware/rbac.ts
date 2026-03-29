import logger from '../utils/logger';

/**
 * Higher-order middleware function to restrict route access based on user role
 */
const authorize = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      logger.warn(`User ${req.user.id} with role ${userRole} denied access to protected route`);
      return res.status(403).json({
        success: false,
        message: 'No permission to access this resource'
      });
    }
    next();
  };
};

export default authorize;
