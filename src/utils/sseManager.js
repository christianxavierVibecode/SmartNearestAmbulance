let clients = [];

/**
 * Add a new SSE client connection
 * @param {Object} res Express response object
 */
function addClient(res) {
  clients.push(res);
}

/**
 * Remove an SSE client connection
 * @param {Object} res Express response object
 */
function removeClient(res) {
  clients = clients.filter(client => client !== res);
}

/**
 * Get count of active SSE clients
 * @returns {number}
 */
function getClientsCount() {
  return clients.length;
}

/**
 * Broadcast an event to all connected SSE clients
 * @param {string} eventName Tipe event (e.g. 'location_update', 'status_update', 'sos_alert')
 * @param {Object} data Payload event
 */
function broadcast(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    client.write(payload);
  });
}

module.exports = {
  addClient,
  removeClient,
  getClientsCount,
  broadcast
};
