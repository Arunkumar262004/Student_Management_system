require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { sequelize } = require('./models');

// Imported files 
const authRoutes    = require('./routes/auth');
const studentRoutes = require('./routes/students');
const auditRoutes   = require('./routes/audit');

const app = express();

// ── Middleware 
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  upload student photos 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  routes 
app.use('/api/auth',       authRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/audit-logs', auditRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Connect DB and start server 
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ alter: true });
    console.log('Database tables synced');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();