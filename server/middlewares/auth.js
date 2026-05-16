const supabase = require('../config/supabase');

/**
 * Verify JWT token từ header bằng Supabase Auth
 * Format: Authorization: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    
    // Sử dụng Supabase để verify token thay vì tự verify thủ công
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Lấy role từ bảng profiles (off-chain/metadata)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Attach user info vào request
    req.user = {
      ...user,
      role: profile?.role || user.app_metadata?.role || user.user_metadata?.role || 'user'
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware để detect user nhưng không bắt buộc login
 */
const detectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        req.user = {
          ...user,
          role: profile?.role || user.app_metadata?.role || user.user_metadata?.role || 'user'
        };
      }
    }
    next();
  } catch (e) {
    // Ignore error, just proceed as anon
    next();
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
  detectUser,
  requireRole,
  requireAdmin,
  requireStaff,
  requireBeneficiary
};
