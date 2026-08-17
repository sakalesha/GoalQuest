// server/controllers/goalSheetController.js
import GoalSheet from '../models/GoalSheet.js';
import Cycle from '../models/Cycle.js';
import { createAuditEntry } from '../utils/auditLogger.js';
import { ENTITY_TYPES, GOAL_SHEET_STATUS } from '../config/constants.js';

export const getOrCreateGoalSheet = async (req, res) => {
  const cycle = await Cycle.findOne({ status: 'OPEN' });
  if (!cycle) return res.status(400).json({ message: 'No active cycle' });

  let sheet = await GoalSheet.findOne({ employeeId: req.user._id, cycleId: cycle._id });
  if (!sheet) {
    sheet = await GoalSheet.create({
      employeeId: req.user._id,
      cycleId: cycle._id,
      status: 'DRAFT'
    });
  }
  res.json(sheet);
};

export const submitGoalSheet = async (req, res) => {
  const sheet = await GoalSheet.findById(req.params.id);
  if (!sheet) return res.status(404).json({ message: 'Goal sheet not found' });

  sheet.status = 'SUBMITTED';
  sheet.submittedAt = new Date();
  await sheet.save();
  res.json(sheet);
};

export const approveGoalSheet = async (req, res) => {
  const sheet = await GoalSheet.findById(req.params.id);
  if (!sheet) return res.status(404).json({ message: 'Goal sheet not found' });

  const oldStatus = sheet.status;
  sheet.status = 'APPROVED'; // Moves to LOCKED implicitly by rules
  sheet.approvedAt = new Date();
  sheet.approvedBy = req.user._id;
  await sheet.save();

  await createAuditEntry({
    entityType: ENTITY_TYPES.GOAL_SHEET,
    entityId: sheet._id,
    actor: req.user._id,
    action: 'APPROVE',
    fieldChanged: 'status',
    oldValue: oldStatus,
    newValue: 'APPROVED'
  });

  res.json(sheet);
};

export const returnGoalSheet = async (req, res) => {
  const { comment } = req.body;
  const sheet = await GoalSheet.findById(req.params.id);
  if (!sheet) return res.status(404).json({ message: 'Goal sheet not found' });

  sheet.status = 'DRAFT';
  sheet.returnedAt = new Date();
  sheet.returnComment = comment;
  await sheet.save();

  res.json(sheet);
};

export const getTeamGoalSheets = async (req, res) => {
  const cycle = await Cycle.findOne({ status: 'OPEN' });
  if (!cycle) return res.json([]);

  const sheets = await GoalSheet.find({ cycleId: cycle._id })
    .populate('employeeId', 'name email department managerId')
    .exec();
  
  // Filter for direct reports
  const teamSheets = sheets.filter(s => s.employeeId.managerId && s.employeeId.managerId.equals(req.user._id));
  res.json(teamSheets);
};
