const AuditLog = require("../models/AuditLog");

function logAudit({ entityType, entityId, action, changedBy, previousValue, newValue, reason }) {
  return AuditLog.create({ entityType, entityId, action, changedBy, previousValue, newValue, reason });
}

module.exports = { logAudit };
