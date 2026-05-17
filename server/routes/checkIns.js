// server/routes/checkIns.js
import express from 'express';
import { 
  upsertCheckIn, 
  getGoalCheckIns, 
  getTeamProgress,
  addManagerComment
} from '../controllers/checkInController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { phaseGate } from '../middleware/phaseGate.js';

const router = express.Router();

router.use(authenticate);

router.get('/goal/:goalId', getGoalCheckIns);
router.get('/team', requireRole('manager', 'admin'), getTeamProgress);
router.post('/', phaseGate(['Q1', 'Q2', 'Q3', 'Q4']), upsertCheckIn);
router.post('/:id/comment', requireRole('manager', 'admin'), addManagerComment);

export default router;
