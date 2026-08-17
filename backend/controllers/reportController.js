// server/controllers/reportController.js
import Goal from '../models/Goal.js';
import CheckIn from '../models/CheckIn.js';
import User from '../models/User.js';
import { generateAchievementReport } from '../utils/exportHelper.js';

export const exportAchievementReport = async (req, res) => {
  const Cycle = (await import('../models/Cycle.js')).default;
  const cycle = await Cycle.findOne({ status: 'OPEN' });
  if (!cycle) return res.status(404).json({ message: 'No active cycle found' });

  // Aggregate data for the report
  const goals = await Goal.find({ cycleId: cycle._id }).populate('employeeId', 'name department');
  
  const reportData = [];
  for (const goal of goals) {
    const checkIns = await CheckIn.find({ goalId: goal._id });
    const ciMap = {};
    let totalScore = 0;
    let count = 0;
    
    checkIns.forEach(ci => {
      ciMap[ci.quarter] = ci;
      totalScore += ci.progressScore;
      count++;
    });

    reportData.push({
      employeeName: goal.employeeId.name,
      department: goal.employeeId.department,
      goalTitle: goal.title,
      uomType: goal.uomType,
      target: goal.target,
      weightage: goal.weightage,
      checkIns: ciMap,
      avgScore: count > 0 ? totalScore / count : 0
    });
  }

  const workbook = await generateAchievementReport(reportData);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=achievement_report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
};

export const getSystemStats = async (req, res) => {
  const Cycle = (await import('../models/Cycle.js')).default;
  const cycle = await Cycle.findOne({ status: 'OPEN' });
  
  if (!cycle) return res.json({ totalEmployees: 0, totalGoals: 0, approved: 0, breakdown: [] });

  const totalEmployees = await User.countDocuments({ role: 'employee' });
  const totalGoals = await Goal.countDocuments({ cycleId: cycle._id });
  const approvedSheets = await (await import('../models/GoalSheet.js')).default.countDocuments({ 
    cycleId: cycle._id,
    status: 'APPROVED' 
  });
  
  const departments = ['Engineering', 'Sales', 'Quality', 'Human Resources', 'Finance'];
  const breakdown = await Promise.all(departments.map(async (dept) => {
    const deptUsers = await User.find({ department: dept });
    if (deptUsers.length === 0) return { dept, rate: 0 };
    
    const deptSheetCount = await (await import('../models/GoalSheet.js')).default.countDocuments({ 
      employeeId: { $in: deptUsers.map(u => u._id) },
      cycleId: cycle._id,
      status: 'APPROVED'
    });
    
    return { dept, rate: Math.round((deptSheetCount / deptUsers.length) * 100) };
  }));

  res.json({
    totalEmployees,
    totalGoals,
    approved: approvedSheets,
    breakdown
  });
};

export const getManagerStats = async (req, res) => {
  const teamMemberIds = await User.find({ managerId: req.user._id }).distinct('_id');
  const Cycle = (await import('../models/Cycle.js')).default;
  const cycle = await Cycle.findOne({ status: 'OPEN' });
  
  const pendingApprovals = !cycle ? 0 : await (await import('../models/GoalSheet.js')).default.countDocuments({ 
    employeeId: { $in: teamMemberIds },
    cycleId: cycle._id,
    status: 'SUBMITTED'
  });
  
  const totalCheckIns = !cycle ? 0 : await CheckIn.countDocuments({
    cycleId: cycle._id,
    goalId: { $in: await Goal.find({ employeeId: { $in: teamMemberIds }, cycleId: cycle._id }).distinct('_id') }
  });

  res.json({
    directReports: teamMemberIds.length,
    pendingApprovals,
    unreadCheckIns: totalCheckIns // Simplified as "unread" for now
  });
};
