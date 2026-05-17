// server/middleware/phaseGate.js
import Cycle from '../models/Cycle.js';

export const phaseGate = (allowedPhases) => {
  return async (req, res, next) => {
    const cycle = await Cycle.findOne({ status: 'OPEN' });
    if (!cycle) {
      return res.status(400).json({ message: 'No active cycle found.' });
    }

    if (!allowedPhases.includes(cycle.phase)) {
      return res.status(403).json({ 
        message: `Current cycle phase is ${cycle.phase}. Action constrained to phases: [${allowedPhases.join(', ')}]` 
      });
    }

    req.currentCycle = cycle;
    next();
  };
};
