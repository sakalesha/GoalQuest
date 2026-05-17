// server/routes/reports.js
import express from 'express';
import { exportAchievementReport, getSystemStats, getManagerStats } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

router.use(authenticate);

router.get('/export', requireRole('admin', 'manager'), exportAchievementReport);
router.get('/stats/system', requireRole('admin'), getSystemStats);
router.get('/stats/manager', requireRole('manager', 'admin'), getManagerStats);

export default router;
