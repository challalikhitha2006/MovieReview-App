const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const reviewRoutes = require('./routes/reviews');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
console.log("Loaded Mongo URI:", process.env.MONGO_URI);
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Middleware
app.use(cors());
app.use(express.json()); // Replaces body-parser

// Routes
app.use('/api/reviews', reviewRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
