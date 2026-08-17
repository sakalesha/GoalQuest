// server/models/Cycle.js
import mongoose from 'mongoose';

const cycleSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  phase: { 
    type: String, 
    enum: ['GOAL_SETTING', 'Q1', 'Q2', 'Q3', 'Q4'], 
    default: 'GOAL_SETTING' 
  },
  openDate: { type: Date, required: true },
  closeDate: { type: Date, required: true },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Cycle', cycleSchema);
