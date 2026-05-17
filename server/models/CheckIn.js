// server/models/CheckIn.js
import mongoose from 'mongoose';
import { computeScore } from '../utils/uomScore.js';

const checkInSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  actualAchievement: { type: Number, default: 0 },
  completionDate: { type: Date },
  status: { type: String, enum: ['NOT_STARTED', 'ON_TRACK', 'COMPLETED'], default: 'NOT_STARTED' },
  progressScore: { type: Number, default: 0 },
  managerComment: { type: String },
  managerCommentAt: { type: Date }
}, { timestamps: true });

// Pre-save: compute score and sync shared goals
checkInSchema.pre('save', async function () {
  const Goal = mongoose.model('Goal');
  const goal = await Goal.findById(this.goalId);
  
  if (goal) {
    const scoreData = computeScore(
      goal.uomType, 
      goal.target, 
      this.actualAchievement, 
      goal.deadline, 
      this.completionDate
    );
    this.progressScore = typeof scoreData === 'object' ? 0 : scoreData;
  }
});

// Post-save: Shared goal sync
checkInSchema.post('save', async function () {
  const Goal = mongoose.model('Goal');
  const goal = await Goal.findById(this.goalId);
  
  // If this is a primary owner updating a shared goal
  if (goal && goal.isShared && goal.primaryOwnerId && goal.primaryOwnerId.equals(this.employeeId)) {
    const sharedGoals = await Goal.find({ sharedFrom: goal._id });
    
    if (sharedGoals.length > 0) {
      const CheckIn = mongoose.model('CheckIn');
      
      for (const sharedGoal of sharedGoals) {
        // Upsert so that if record doesn't exist, it's created (Fixes Discrepancy 3.1)
        await CheckIn.findOneAndUpdate(
          { goalId: sharedGoal._id, quarter: this.quarter },
          { 
            employeeId: sharedGoal.employeeId,
            cycleId: this.cycleId,
            actualAchievement: this.actualAchievement,
            completionDate: this.completionDate,
            progressScore: this.progressScore,
            status: this.status
          },
          { upsert: true, new: true }
        );
      }
    }
  }
});

export default mongoose.model('CheckIn', checkInSchema);
