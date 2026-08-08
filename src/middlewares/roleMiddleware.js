/**
 * Middleware generator for role-based authorization
 * @param  {...string} roles Allowed roles (e.g. 'driver', 'operator', 'management')
 */
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Akses ditolak. Pengguna belum terautentikasi'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini'
      });
    }

    next();
  };
}

module.exports = {
  allowRoles
};
