import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../server/config/db.js';

import authRoutes from '../server/routes/auth.js';
import goalSheetRoutes from '../server/routes/goalSheets.js';
import goalRoutes from '../server/routes/goals.js';
import checkInRoutes from '../server/routes/checkIns.js';
import adminRoutes from '../server/routes/admin.js';
import reportRoutes from '../server/routes/reports.js';

dotenv.config();

const app = express();

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/goal-sheets', goalSheetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
