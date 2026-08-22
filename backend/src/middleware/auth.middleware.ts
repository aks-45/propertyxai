import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

/**
 * Middleware to authenticate JWT token
 * Attaches userId to request object if token is valid
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ACCESS_TOKEN_REQUIRED',
        message: 'Access token is required',
      },
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    }

    // Attach user info to request
    // @ts-ignore: Adding custom property to Request
    req.userId = user.userId;
    // @ts-ignore: Adding custom property to Request
    req.email = user.email;
    next();
  });
};

/**
 * Middleware to optional authenticate JWT token
 * Useful for routes that can work with or without auth
 */
export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // No token, continue without auth
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      // Invalid token, continue without auth (don't fail the request)
      return next();
    }

    // Attach user info to request
    // @ts-ignore: Adding custom property to Request
    req.userId = user.userId;
    // @ts-ignore: Adding custom property to Request
    req.email = user.email;
    next();
  });
};

export default { authenticateToken, optionalAuthenticateToken };