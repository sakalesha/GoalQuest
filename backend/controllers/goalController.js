// server/controllers/goalController.js
import Goal from '../models/Goal.js';
import GoalSheet from '../models/GoalSheet.js';
import { createAuditEntry } from '../utils/auditLogger.js';
import { ENTITY_TYPES, GOAL_SHEET_STATUS } from '../config/constants.js';

export const createGoal = async (req, res) => {
  const { goalSheetId } = req.body;
  const sheet = await GoalSheet.findById(goalSheetId);
  
  if (sheet.status !== 'DRAFT') {
    return res.status(403).json({ message: 'Goal sheet is locked. Cannot add goals.' });
  }

  // Discrepancy 8.1: Zero-Based Target Enforcement
  if (req.body.uomType === 'ZERO') {
    req.body.target = 0;
  }

  const goal = new Goal({
    ...req.body,
    employeeId: req.user._id,
    cycleId: sheet.cycleId
  });
  
  await goal.save();
  res.status(201).json(goal);
};

export const updateGoal = async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ message: 'Goal not found' });

  const sheet = await GoalSheet.findById(goal.goalSheetId);
  
  // Locking Check
  if (sheet.status === 'APPROVED' || sheet.status === 'LOCKED') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Approved goals are locked. Only Admin can modify.' });
    }
  }

  // Shared Goal Check
  if (goal.isShared && !goal.primaryOwnerId.equals(req.user._id) && req.user.role !== 'admin') {
    const { title, target, deadline, uomType, description } = req.body;
    if (title || target || deadline || uomType || description) {
      return res.status(403).json({ message: 'Shared goal metadata (Title, Target, Description) is read-only.' });
    }
  }

  // Discrepancy 8.1: Zero-Based Target Enforcement
  if (req.body.uomType === 'ZERO') {
    req.body.target = 0;
  }

  const oldGoal = goal.toObject();
  Object.assign(goal, req.body);
  await goal.save();

  if (sheet.status === 'APPROVED' || sheet.status === 'LOCKED') {
    await createAuditEntry({
      entityType: ENTITY_TYPES.GOAL,
      entityId: goal._id,
      actor: req.user._id,
      action: 'UPDATE_LOCKED',
      fieldChanged: 'multiple',
      oldValue: oldGoal,
      newValue: goal.toObject()
    });
  }

  res.json(goal);
};

export const deleteGoal = async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ message: 'Goal not found' });

  const sheet = await GoalSheet.findById(goal.goalSheetId);
  if (sheet.status !== 'DRAFT' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Cannot delete from a locked goal sheet.' });
  }

  // Audit deletion for locked sheets (Fixes Discrepancy 4.1)
  if (sheet.status !== 'DRAFT') {
    await createAuditEntry({
      entityType: ENTITY_TYPES.GOAL,
      entityId: goal._id,
      actor: req.user._id,
      action: 'DELETE_LOCKED',
      details: `Admin deleted goal: ${goal.title}`
    });
  }

  await goal.deleteOne();
  res.json({ message: 'Goal removed' });
};

export const getGoalsBySheet = async (req, res) => {
  const goals = await Goal.find({ goalSheetId: req.params.sheetId });
  res.json(goals);
};

export const pushSharedGoal = async (req, res) => {
  const { recipients, goalData } = req.body; // recipients is array of employeeIds
  
  // Create primary copy
  const primaryGoal = new Goal({
    ...goalData,
    isShared: true,
    primaryOwnerId: req.user._id
  });
  await primaryGoal.save();

  // Create shared copies for recipients
  for (const empId of recipients) {
    const sheet = await GoalSheet.findOne({ employeeId: empId }).sort({ createdAt: -1 });
    if (sheet) {
      // Unresolved 2.2: Calculate total weightage and enforce limit
      const existingGoals = await Goal.find({ goalSheetId: sheet._id });
      const currentTotal = existingGoals.reduce((sum, g) => sum + g.weightage, 0);
      const newWeight = 10;

      if (currentTotal + newWeight > 100) {
        console.warn(`Skipping shared goal for employee ${empId}: Sheet ${sheet._id} would exceed 100% weightage.`);
        continue;
      }
      
      const sharedGoal = new Goal({
        ...goalData,
        goalSheetId: sheet._id,
        employeeId: empId,
        cycleId: sheet.cycleId,
        isShared: true,
        primaryOwnerId: req.user._id,
        sharedFrom: primaryGoal._id,
        weightage: newWeight
      });
      await sharedGoal.save();

      // Unresolved 4.2: Audit push to locked sheets
      if (sheet.status !== 'DRAFT') {
        await createAuditEntry({
          entityType: ENTITY_TYPES.GOAL_SHEET,
          entityId: sheet._id,
          actor: req.user._id,
          action: 'PUSH_SHARED_GOAL',
          details: `Admin pushed shared goal to locked sheet. Title: ${goalData.title}. New total weightage: ${currentTotal + newWeight}%`
        });
      }
    }
  }

  res.status(201).json({ message: 'Shared goal pushed successfully' });
};
