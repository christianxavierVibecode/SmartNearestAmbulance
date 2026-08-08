const db = require('../config/db');

/**
 * Find user by username
 * @param {string} username
 * @returns {Promise<Object|null>} User object or null
 */
async function findByUsername(username) {
  const [rows] = await db.query(
    'SELECT id, name, role, username, password_hash, created_at FROM users WHERE username = ?',
    [username]
  );
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  findByUsername
};
