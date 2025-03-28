const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies

// Basic Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API Routes
app.use('/api', apiRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 