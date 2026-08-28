const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes');
const shareRoutes = require('./routes/shareRoutes');
const searchRoutes = require('./routes/searchRoutes');
const trashRoutes = require('./routes/trashRoutes');
const starRoutes = require('./routes/starRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/stars', starRoutes);


// Health check route (use app.get instead of app.use)
app.get('/home', (req, res) => {
  return res.send(`Server is working`);
});


// Start server
const port = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
}


module.exports = app;
