import mongoose from "mongoose";

const escalationLogSchema = new mongoose.Schema({
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: "EscalationRule", required: true },
  triggerEvent: { type: String, required: true },
  contextKey: { type: String, index: true },
  stageTarget: { type: String, enum: ["employee", "manager", "skip_level", "hr", "admin", "custom"] },
  stageAfterDays: Number,
  affectedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  escalatedToUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: String,
  triggeredAt: { type: Date, default: Date.now },
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

escalationLogSchema.index({ affectedUserId: 1, triggeredAt: -1 });

export default mongoose.model("EscalationLog", escalationLogSchema);
