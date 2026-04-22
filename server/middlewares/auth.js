const jwt = require('jsonwebtoken');

/**
 * Verify JWT token từ header
 * Format: Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');

    // Attach user info vào request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Kiểm tra user có role required không
 * @param {string|string[]} allowedRoles - Role hoặc mảng roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Trước tiên verify token
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${rolesArray.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Middleware để require specific role
 */
const requireAdmin = requireRole('admin');
const requireStaff = requireRole(['admin', 'staff']);
const requireBeneficiary = requireRole(['admin', 'beneficiary']);

module.exports = {
  verifyToken,
  requireRole,
  requireAdmin,
  requireStaff,
  requireBeneficiary
};
