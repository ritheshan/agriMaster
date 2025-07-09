import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT and attach user to request
 */
export function authMiddleware(req, res, next) {
  // Check for token in multiple places
  const tokenFromCookie = req.cookies?.token;
  const tokenFromHeader = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  
  const token = tokenFromCookie || tokenFromHeader;
  
  if (!token) {
    console.log('❌ Auth Middleware: No token found');
    console.log('Cookie token:', tokenFromCookie ? '✓ Present' : '✗ Missing');
    console.log('Header token:', tokenFromHeader ? '✓ Present' : '✗ Missing');
    return res.status(401).json({ message: 'Access Denied: No valid token provided' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user:', verified.id || verified._id);
    req.user = verified; // attach user data to request
    next();
  } catch (err) {
    console.error('❌ JWT Verification Error:', err.message);
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
    console.log('🔍 Checking user status for ID:', req.user.id || req.user._id);
    
    if (!req.user || (!req.user.id && !req.user._id)) {
      console.error('❌ User object missing or invalid in request:', req.user);
      return res.status(400).json({
        success: false,
        error: 'Invalid user data in request'
      });
    }
    
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      console.error(`❌ User not found with ID: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (!user.isActive) {
      console.log(`⚠️ Deactivated account access attempt: ${userId}`);
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated'
      });
    }
    
    console.log(`✅ User status verified for: ${user.name || userId}`);
    req.user.userData = user;
    next();
  } catch (error) {
    console.error('❌ Error checking user status:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking user status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
  