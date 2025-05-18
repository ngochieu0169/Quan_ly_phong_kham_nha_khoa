const express = require('express');
const cors = require('cors');
require('dotenv').config();
const quyenRoutes = require('./src/routers/quyenRoutes');
const userRoutes = require('./src/routers/userRoutes');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.use(express.json());

app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes

// test API
const routes = require('./src/routers/index');
app.use('/api', routes);

// quyen
app.use('/api/quyen', quyenRoutes);
// user
app.use('/api/users', userRoutes);



// Default 404 route
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
