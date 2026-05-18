import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  entityType: { type: String, enum: ["goal", "goalsheet", "cycle", "user"], index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
  action: { type: String, required: true, index: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  previousValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  reason: String,
  timestamp: { type: Date, default: Date.now, index: true }
});

export default mongoose.model("AuditLog", auditLogSchema);