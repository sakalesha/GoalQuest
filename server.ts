// server.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

// Routes
import authRoutes from './server/routes/auth.js';
import goalSheetRoutes from './server/routes/goalSheets.js';
import goalRoutes from './server/routes/goals.js';
import checkInRoutes from './server/routes/checkIns.js';
import adminRoutes from './server/routes/admin.js';
import reportRoutes from './server/routes/reports.js';
import connectDB from './server/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect to Database
  await connectDB();

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/goal-sheets', goalSheetRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/check-ins', checkInRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/reports', reportRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
