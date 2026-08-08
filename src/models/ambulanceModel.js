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

/**
 * Get all available ambulances joined with their latest GPS location
 * @returns {Promise<Array>}
 */
async function getAvailableWithLastLocation() {
  const [rows] = await db.query(`
    SELECT 
      a.id, 
      a.plate_number, 
      a.driver_id, 
      u.name AS driver_name, 
      a.status, 
      a.last_seen_at, 
      lh.latitude, 
      lh.longitude,
      lh.recorded_at AS location_recorded_at
    FROM ambulances a
    LEFT JOIN users u ON a.driver_id = u.id
    INNER JOIN (
      SELECT lh1.ambulance_id, lh1.latitude, lh1.longitude, lh1.recorded_at
      FROM location_history lh1
      INNER JOIN (
        SELECT ambulance_id, MAX(id) AS max_id
        FROM location_history
        GROUP BY ambulance_id
      ) lh2 ON lh1.id = lh2.max_id
    ) lh ON a.id = lh.ambulance_id
    WHERE a.status = 'available'
  `);
  return rows;
}

module.exports = {
  getAll,
  findById,
  updateStatus,
  updateLastSeen,
  getAvailableWithLastLocation
};
