const sseManager = require('../utils/sseManager');

/**
 * Handle GET /api/stream (SSE Endpoint)
 */
function subscribeStream(req, res) {
  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx if present

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  // Add client to active clients list
  sseManager.addClient(res);

  // Send initial connection comment
  res.write(': connected\n\n');

  // Heartbeat every 20 seconds
  const heartbeatInterval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  // Cleanup when client closes connection
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sseManager.removeClient(res);
  });
}

module.exports = {
  subscribeStream
};
