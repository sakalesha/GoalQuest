/**
 * server/utils/uomScore.js
 * Comprehensive scoring logic for Goal tracking
 */

/**
 * Computes progress score based on UoM type and achievements.
 * 
 * @param {string} uomType - MIN, MAX, TIMELINE, ZERO
 * @param {number} target - Target value
 * @param {number} achievement - Actual achievement
 * @param {Date} deadline - Deadline for TIMELINE
 * @param {Date} completionDate - Completion date for TIMELINE
 * @returns {number|object} - Score (0 to 1) or metadata object for partial states
 */
export const computeScore = (uomType, target, achievement, deadline, completionDate) => {
  switch (uomType) {
    case 'MAX':
      // Higher is better: score = achievement / target
      if (!target || target === 0) return 1;
      const maxScore = achievement / target;
      return Math.min(1, maxScore);

    case 'MIN':
      // Lower is better: score = target / achievement
      if (!achievement || achievement === 0) return 1; // Zero achievement = perfect if trying to minimize
      if (!target || target === 0) return achievement === 0 ? 1 : 0;
      const minScore = target / achievement;
      return Math.min(1, minScore);

    case 'TIMELINE':
      // Date-based: if completion <= deadline, score = 1, else 0
      if (!deadline) return 0;
      if (!completionDate) {
        const remaining = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return { score: null, daysRemaining: Math.max(0, remaining) };
      }
      return new Date(completionDate) <= new Date(deadline) ? 1 : 0;

    case 'ZERO':
      // Binary outcome: success if achievement is exactly 0
      return achievement === 0 ? 1 : 0;

    default:
      return 0;
  }
};
