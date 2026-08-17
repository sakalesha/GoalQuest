// server/utils/auditLogger.js
import AuditLog from '../models/AuditLog.js';

/**
 * Creates an audit log entry for historical tracking.
 */
export const createAuditEntry = async ({
  entityType,
  entityId,
  actor,
  action,
  fieldChanged = null,
  oldValue = null,
  newValue = null
}) => {
  try {
    const log = new AuditLog({
      entityType,
      entityId,
      actor,
      action,
      fieldChanged,
      oldValue,
      newValue,
      timestamp: new Date()
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Audit Log Error:', error);
    // Non-blocking failure for logging
    return null;
  }
};
