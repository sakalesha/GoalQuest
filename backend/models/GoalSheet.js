// server/models/GoalSheet.js
import mongoose from 'mongoose';

const goalSheetSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle', required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED'], 
    default: 'DRAFT' 
  },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  returnedAt: { type: Date },
  returnComment: { type: String }
});

export default mongoose.model('GoalSheet', goalSheetSchema);
