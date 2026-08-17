// server/routes/goals.js
import express from 'express';
import { 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  getGoalsBySheet,
  pushSharedGoal
} from '../controllers/goalController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { phaseGate } from '../middleware/phaseGate.js';
import { validateWeightage } from '../middleware/validateWeightage.js';

const router = express.Router();

router.use(authenticate);

router.get('/sheet/:sheetId', getGoalsBySheet);
router.post('/', phaseGate(['GOAL_SETTING']), validateWeightage, createGoal);
router.patch('/:id', validateWeightage, updateGoal);
router.delete('/:id', phaseGate(['GOAL_SETTING']), deleteGoal);
router.post('/push', requireRole('manager', 'admin'), pushSharedGoal);

export default router;
