import type { Request, Response, NextFunction } from 'express';
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
declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export default auth;
//# sourceMappingURL=auth.d.ts.map