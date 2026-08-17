// server/models/Goal.js
import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  goalSheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'GoalSheet', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle', required: true },
  thrustArea: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  uomType: { type: String, enum: ['MIN', 'MAX', 'TIMELINE', 'ZERO'], required: true },
  target: { type: Number, required: true },
  deadline: { type: Date },
  weightage: { type: Number, required: true, min: 10 },
  status: { type: String, enum: ['NOT_STARTED', 'ON_TRACK', 'COMPLETED'], default: 'NOT_STARTED' },
  isShared: { type: Boolean, default: false },
  primaryOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
}, { timestamps: true });

// Max 8 goals validation
goalSchema.pre('save', async function () {
  if (this.isNew) {
    const count = await mongoose.model('Goal').countDocuments({ goalSheetId: this.goalSheetId });
    if (count >= 8) {
      throw new Error('Maximum 8 goals allowed per employee per cycle.');
    }
  }
});

export default mongoose.model('Goal', goalSchema);
