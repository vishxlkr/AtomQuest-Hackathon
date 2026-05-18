import AuditLog from "../models/AuditLog.js";

function logAudit({ entityType, entityId, action, changedBy, previousValue, newValue, reason }) {
  return AuditLog.create({ entityType, entityId, action, changedBy, previousValue, newValue, reason });
}

export { logAudit };