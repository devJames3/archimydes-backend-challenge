import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient role',
        errors: []
      });
    }
    next();
  };
}
