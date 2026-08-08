const db = require('../config/db');

/**
 * Get all ambulances with driver name
 * @returns {Promise<Array>}
 */
async function getAll() {
  const [rows] = await db.query(`
    SELECT 
      a.id, 
      a.plate_number, 
      a.driver_id, 
      u.name AS driver_name, 
      a.status, 
      a.last_seen_at, 
      a.created_at
    FROM ambulances a
    LEFT JOIN users u ON a.driver_id = u.id
    ORDER BY a.id ASC
  `);
  return rows;
}

/**
 * Find ambulance by ID
 * @param {number} id 
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  const [rows] = await db.query(`
    SELECT 
      a.id, 
      a.plate_number, 
      a.driver_id, 
      u.name AS driver_name, 
      a.status, 
      a.last_seen_at, 
      a.created_at
    FROM ambulances a
    LEFT JOIN users u ON a.driver_id = u.id
    WHERE a.id = ?
  `, [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Update operational status of ambulance
 * @param {number} id 
 * @param {string} status 
 * @returns {Promise<boolean>}
 */
async function updateStatus(id, status) {
  const [result] = await db.query(
    'UPDATE ambulances SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows > 0;
}

/**
 * Update last_seen_at timestamp for an ambulance
 * @param {number} id 
 * @returns {Promise<boolean>}
 */
async function updateLastSeen(id) {
  const [result] = await db.query(
    'UPDATE ambulances SET last_seen_at = NOW() WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getAll,
  findById,
  updateStatus,
  updateLastSeen
};
