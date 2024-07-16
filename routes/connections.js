const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Create a new connection
router.post('/', auth, async (req, res) => {
  try {
    const connectionId = crypto.randomBytes(16).toString('hex');
    req.user.connections.push(connectionId);
    await req.user.save();
    res.json({ connectionId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all connections for the user
router.get('/', auth, async (req, res) => {
  try {
    res.json(req.user.connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Revoke a connection
router.delete('/:connectionId', auth, async (req, res) => {
  try {
    req.user.connections = req.user.connections.filter(conn => conn !== req.params.connectionId);
    await req.user.save();
    res.json({ message: 'Connection revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
