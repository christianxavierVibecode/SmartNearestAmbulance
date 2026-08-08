const db = require('../config/db');

/**
 * Insert new location record into location_history
 * @param {number} ambulanceId 
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Promise<Object>} Inserted record details
 */
async function insertLocation(ambulanceId, lat, lng) {
  const recordedAt = new Date();
  const [result] = await db.query(
    'INSERT INTO location_history (ambulance_id, latitude, longitude, recorded_at) VALUES (?, ?, ?, ?)',
    [ambulanceId, lat, lng, recordedAt]
  );
  return {
    id: result.insertId,
    ambulance_id: ambulanceId,
    latitude: lat,
    longitude: lng,
    recorded_at: recordedAt
  };
}

module.exports = {
  insertLocation
};
