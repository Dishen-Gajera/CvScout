const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

// Database connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/resume-scanner';
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB.'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Check that MongoDB is running locally on port 27017 or that MONGO_URI is set correctly.');
  });

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scans', require('./routes/scans'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Resume Scanner Backend is running.' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
