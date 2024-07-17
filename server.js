require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const logger = require('./logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const connectionRoutes = require('./routes/connections');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  // Apply rate limiting to all requests
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Apply stricter rate limiting to auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
  });
  app.use('/api/auth', authLimiter);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('SCPS Backend is running');
});

// Error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
