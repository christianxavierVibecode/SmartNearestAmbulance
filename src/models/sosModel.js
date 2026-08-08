const db = require('../config/db');

/**
 * Create a new SOS alert
 * @param {number} ambulanceId
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<Object>} Created alert record
 */
async function createAlert(ambulanceId, lat, lng) {
  const triggeredAt = new Date();
  const [result] = await db.query(
    'INSERT INTO sos_alerts (ambulance_id, latitude, longitude, triggered_at, resolved) VALUES (?, ?, ?, ?, FALSE)',
    [ambulanceId, lat, lng, triggeredAt]
  );
  return {
    id: result.insertId,
    ambulance_id: ambulanceId,
    latitude: lat,
    longitude: lng,
    triggered_at: triggeredAt,
    resolved: false,
    resolved_at: null
  };
}

/**
 * Resolve an existing SOS alert
 * @param {number} id Alert ID
 * @returns {Promise<boolean>}
 */
async function resolveAlert(id) {
  const [result] = await db.query(
    'UPDATE sos_alerts SET resolved = TRUE, resolved_at = NOW() WHERE id = ? AND resolved = FALSE',
    [id]
  );
  return result.affectedRows > 0;
}

/**
 * Find alert by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  const [rows] = await db.query(
    'SELECT * FROM sos_alerts WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  createAlert,
  resolveAlert,
  findById
};
