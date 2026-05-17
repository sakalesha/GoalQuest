// server/routes/goalSheets.js
import express from 'express';
import { 
  getOrCreateGoalSheet, 
  submitGoalSheet, 
  approveGoalSheet, 
  returnGoalSheet,
  getTeamGoalSheets
} from '../controllers/goalSheetController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateWeightage } from '../middleware/validateWeightage.js';

const router = express.Router();

router.use(authenticate);

router.get('/my', getOrCreateGoalSheet);
router.get('/team', requireRole('manager', 'admin'), getTeamGoalSheets);
router.post('/:id/submit', validateWeightage, submitGoalSheet);
router.post('/:id/approve', requireRole('manager', 'admin'), approveGoalSheet);
router.post('/:id/return', requireRole('manager', 'admin'), returnGoalSheet);

export default router;
