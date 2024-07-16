const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { passphrase } = req.body;
    const user = new User({ passphrase });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Login user
// Login user
router.post('/login', async (req, res) => {
  try {
    const { passphrase } = req.body;
    const user = await User.findOne({ passphrase: { $exists: true } });
    
    if (!user || !(await user.matchPassphrase(passphrase))) {
      return res.status(400).json({ message: 'Invalid passphrase' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
