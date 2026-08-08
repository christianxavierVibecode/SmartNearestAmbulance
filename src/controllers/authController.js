const userModel = require('../models/userModel');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

/**
 * Handle POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username dan password wajib diisi'
      });
    }

    // Find user by username
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        message: 'Username atau password salah'
      });
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Username atau password salah'
      });
    }

    // Create JWT token payload
    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    const token = generateToken(payload);

    return res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in authController.login:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
}

module.exports = {
  login
};
