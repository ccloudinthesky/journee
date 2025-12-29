import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { database } from '../config/database';
import { User } from '../types';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password_hash'>;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    const payload: JwtPayload = verifyToken(token);
    
    // Get user from database
    const user = await database.get(
      'SELECT id, email, username, created_at FROM users WHERE id = ?',
      [payload.userId]
    ) as Omit<User, 'password_hash'> | undefined;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'Invalid token'
      });
      return;
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Invalid token'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }
    
    const token = extractTokenFromHeader(authHeader);
    const payload: JwtPayload = verifyToken(token);
    
    const user = await database.get(
      'SELECT id, email, username, created_at FROM users WHERE id = ?',
      [payload.userId]
    ) as Omit<User, 'password_hash'> | undefined;
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
