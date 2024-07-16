const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Register a new user
router.post('/register', [
  body('passphrase')
    .isLength({ min: 10 }).withMessage('Passphrase must be at least 10 characters long')
    .matches(/\d/).withMessage('Passphrase must contain at least one number')
    .matches(/[A-Z]/).withMessage('Passphrase must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Passphrase must contain at least one lowercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Passphrase must contain at least one special character')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { passphrase } = req.body;
    const user = new User({ passphrase });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Passphrase already in use' });
    }
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

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
