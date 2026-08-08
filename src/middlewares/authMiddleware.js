const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token from Authorization header
 */
function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Akses ditolak. Token tidak ditemukan'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token tidak valid atau telah kedaluwarsa'
    });
  }
}

module.exports = verifyAuthToken;
