const db = require('../config/db');

/**
 * Start a new trip for an ambulance
 * @param {number} ambulanceId 
 * @param {string|null} startLocation 
 * @returns {Promise<Object>} Created trip record
 */
async function startTrip(ambulanceId, startLocation = null) {
  const startTime = new Date();
  const [result] = await db.query(
    'INSERT INTO trips (ambulance_id, start_time, start_location) VALUES (?, ?, ?)',
    [ambulanceId, startTime, startLocation]
  );
  return {
    id: result.insertId,
    ambulance_id: ambulanceId,
    start_time: startTime,
    end_time: null,
    start_location: startLocation,
    end_location: null
  };
}

/**
 * End an ongoing active trip for an ambulance
 * @param {number} ambulanceId 
 * @param {string|null} endLocation 
 * @returns {Promise<boolean>}
 */
async function endTrip(ambulanceId, endLocation = null) {
  const [result] = await db.query(`
    UPDATE trips 
    SET end_time = NOW(), end_location = ? 
    WHERE ambulance_id = ? AND end_time IS NULL 
    ORDER BY id DESC 
    LIMIT 1
  `, [endLocation, ambulanceId]);
  
  return result.affectedRows > 0;
}

/**
 * Get trip history for a specific ambulance
 * @param {number} ambulanceId 
 * @returns {Promise<Array>}
 */
async function getHistoryByAmbulance(ambulanceId) {
  const [rows] = await db.query(
    'SELECT * FROM trips WHERE ambulance_id = ? ORDER BY id DESC',
    [ambulanceId]
  );
  return rows;
}

module.exports = {
  startTrip,
  endTrip,
  getHistoryByAmbulance
};
