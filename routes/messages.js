const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');

// Send a message
router.post('/:connectionId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const { connectionId } = req.params;

    // Check if the connection exists and belongs to the user
    const user = await User.findById(req.user._id);
    if (!user.connections.includes(connectionId)) {
      return res.status(400).json({ message: 'Invalid connection' });
    }

    const message = new Message({
      connectionId,
      sender: req.user._id
    });
    message.encryptMessage(content, connectionId);
    await message.save();

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages for a connection
router.get('/:connectionId', auth, async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Check if the connection exists and belongs to the user
    const user = await User.findById(req.user._id);
    if (!user.connections.includes(connectionId)) {
      return res.status(400).json({ message: 'Invalid connection' });
    }

    const messages = await Message.find({ connectionId }).sort('createdAt');
    const decryptedMessages = messages.map(message => ({
      id: message._id,
      sender: message.sender,
      content: message.decryptMessage(connectionId),
      createdAt: message.createdAt
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
