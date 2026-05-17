// server/controllers/checkInController.js
import CheckIn from '../models/CheckIn.js';
import Goal from '../models/Goal.js';
import Cycle from '../models/Cycle.js';

export const upsertCheckIn = async (req, res) => {
  const { goalId, quarter, actualAchievement, completionDate, status } = req.body;
  const cycle = await Cycle.findOne({ status: 'OPEN' });

  if (!cycle) return res.status(400).json({ message: 'No active cycle found.' });

  // Discrepancy 5.1: Quarter Spoofing Fix
  if (cycle.phase !== quarter) {
    return res.status(403).json({ 
      message: `Quarterly updates are only allowed for the active phase: ${cycle.phase}. You tried to update ${quarter}.` 
    });
  }

  let checkIn = await CheckIn.findOne({ goalId, quarter });

  if (checkIn) {
    checkIn.actualAchievement = actualAchievement;
    checkIn.completionDate = completionDate;
    checkIn.status = status;
    await checkIn.save();
  } else {
    checkIn = new CheckIn({
      goalId,
      employeeId: req.user._id,
      cycleId: cycle._id,
      quarter,
      actualAchievement,
      completionDate,
      status
    });
    await checkIn.save();
  }

  res.json(checkIn);
};

export const getGoalCheckIns = async (req, res) => {
  const checkIns = await CheckIn.find({ goalId: req.params.goalId });
  res.json(checkIns);
};

export const getTeamProgress = async (req, res) => {
  const cycle = await Cycle.findOne({ status: 'OPEN' });
  if (!cycle) return res.json([]);

  const checkIns = await CheckIn.find({ cycleId: cycle._id })
    .populate({
      path: 'goalId',
      populate: { path: 'employeeId', select: 'name department managerId' }
    });

  const teamProgress = checkIns.filter(c => 
    c.goalId.employeeId.managerId && 
    c.goalId.employeeId.managerId.equals(req.user._id)
  );

  res.json(teamProgress);
};

export const addManagerComment = async (req, res) => {
  const { comment } = req.body;
  const checkIn = await CheckIn.findById(req.params.id);
  if (!checkIn) return res.status(404).json({ message: 'Check-in not found' });

  checkIn.managerComment = comment;
  checkIn.managerCommentAt = new Date();
  await checkIn.save();

  res.json(checkIn);
};
