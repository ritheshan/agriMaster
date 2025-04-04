import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT and attach user to request
 */
export function authMiddleware(req, res, next) {
  const token = req.cookies?.token; // 👈 Get JWT from cookie

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token found in cookies' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // attach user data to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Alternative protect middleware (commonly used name)
 */
export const protect = authMiddleware;

/**
 * Middleware to authorize specific roles
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
}

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = authorizeRoles('admin');

/**
 * Middleware to check if user is farmer or admin
 */
export const requireFarmer = authorizeRoles('farmer', 'admin');

/**
 * Middleware to check if user exists and is active
 */
export async function checkUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated'
      });
    }
    
    req.user.userData = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error checking user status'
    });
  }
}
  