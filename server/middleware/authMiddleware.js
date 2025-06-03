import jwt from 'jsonwebtoken';

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
 * Middleware to authorize specific roles
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403); // Forbidden
    }
    next();
  };
}