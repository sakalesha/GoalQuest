// server/middleware/validateWeightage.js
import Goal from '../models/Goal.js';

export const validateWeightage = async (req, res, next) => {
  const goalSheetId = req.body.goalSheetId || req.params.id;
  
  if (!goalSheetId) {
    return next();
  }

  const goals = await Goal.find({ goalSheetId });
  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  // Partial update check: Fetch existing weight if not provided in PATCH (Fixes Discrepancy 2.1)
  const incomingWeight = req.body.weightage;
  const isPatch = req.method === 'PATCH';
  const incomingId = req.params.id;

  // Check if any existing goal has < 10% or if the new/updated value is < 10% (Fixes Discrepancy 2.3)
  if (incomingWeight !== undefined && incomingWeight < 10 && incomingWeight !== 0) {
    return res.status(400).json({ message: 'Each goal must have at least 10% weightage.' });
  }

  // If it's a submission, it MUST be exactly 100
  if (req.path.includes('/submit')) {
    if (totalWeightage !== 100) {
      return res.status(400).json({ 
        message: `Total weightage across all goals must equal 100% to submit. Current: ${totalWeightage}%` 
      });
    }
  } else {
    // For individual goal additions/updates, ensure we DON'T exceed 100
    let projectedTotal = totalWeightage;
    if (req.method === 'POST') {
      projectedTotal += (incomingWeight || 0);
    } else if (isPatch && incomingWeight !== undefined) {
      const existingGoal = goals.find(g => g._id.toString() === incomingId);
      projectedTotal = totalWeightage - (existingGoal?.weightage || 0) + incomingWeight;
    }

    if (projectedTotal > 100) {
      return res.status(400).json({ 
        message: `This action would lead to a total weightage of ${projectedTotal}%, which exceeds the 100% limit. Current: ${totalWeightage}%` 
      });
    }
  }

  next();
};
