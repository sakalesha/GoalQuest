// server/controllers/adminController.js
import Cycle from '../models/Cycle.js';
import AuditLog from '../models/AuditLog.js';
import GoalSheet from '../models/GoalSheet.js';
import CheckIn from '../models/CheckIn.js';
import User from '../models/User.js';

export const getCycles = async (req, res) => {
  const cycles = await Cycle.find().sort({ year: -1 });
  res.json(cycles);
};

export const createCycle = async (req, res) => {
  const { year, openDate, closeDate } = req.body;
  // Close any existing open cycles
  await Cycle.updateMany({ status: 'OPEN' }, { status: 'CLOSED' });

  const cycle = new Cycle({
    year,
    openDate,
    closeDate,
    status: 'OPEN',
    phase: 'GOAL_SETTING',
    createdBy: req.user._id
  });
  await cycle.save();
  res.status(201).json(cycle);
};

export const updateCyclePhase = async (req, res) => {
  const { phase } = req.body;
  const cycle = await Cycle.findById(req.params.id);
  cycle.phase = phase;
  await cycle.save();
  res.json(cycle);
};

export const getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find()
    .populate('actor', 'name email')
    .sort({ timestamp: -1 })
    .limit(100);
  res.json(logs);
};

export const getCompletionStats = async (req, res) => {
  const cycle = await Cycle.findOne({ status: 'OPEN' });
  if (!cycle) return res.json({ totalEmployees: 0, submitted: 0, approved: 0, breakdown: [] });

  const totalEmployees = await User.countDocuments({ role: { $ne: 'admin' } });
  const sheets = await GoalSheet.find({ cycleId: cycle._id }); // Filter by active cycle

  const stats = {
    totalEmployees,
    drafts: sheets.filter(s => s.status === 'DRAFT').length,
    submitted: sheets.filter(s => s.status === 'SUBMITTED').length,
    approved: sheets.filter(s => s.status === 'APPROVED' || s.status === 'LOCKED').length
  };

  // Real departmental completion
  const departments = ['Engineering', 'Sales', 'Quality', 'Human Resources', 'Finance'];
  const breakdown = await Promise.all(departments.map(async (dept) => {
    const deptUsers = await User.find({ department: dept });
    if (deptUsers.length === 0) return { dept, rate: 0 };
    
    // Calculate rate based on approved sheets for that department
    const deptSheetCount = await GoalSheet.countDocuments({ 
      employeeId: { $in: deptUsers.map(u => u._id) },
      cycleId: cycle._id,
      status: { $in: ['APPROVED', 'LOCKED'] }
    });
    
    return { dept, rate: Math.round((deptSheetCount / deptUsers.length) * 100) };
  }));

  res.json({ ...stats, breakdown });
};
