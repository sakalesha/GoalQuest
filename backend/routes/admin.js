// server/routes/admin.js
import express from 'express';
import { 
  getCycles, 
  createCycle, 
  updateCyclePhase,
  getAuditLogs,
  getCompletionStats
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/cycles', getCycles);
router.post('/cycles', createCycle);
router.patch('/cycles/:id/phase', updateCyclePhase);
router.get('/audit-logs', getAuditLogs);
router.get('/stats', getCompletionStats);
router.get('/users', async (req, res) => {
  const users = await (await import('../models/User.js')).default.find({}, 'name email department role');
  res.json(users);
});
router.get('/goal-sheets', async (req, res) => {
  const sheets = await (await import('../models/GoalSheet.js')).default.find().populate('employeeId', 'name email department');
  res.json(sheets);
});
router.patch('/goal-sheets/:id/status', async (req, res) => {
  const { status } = req.body;
  const sheet = await (await import('../models/GoalSheet.js')).default.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(sheet);
});

export default router;
