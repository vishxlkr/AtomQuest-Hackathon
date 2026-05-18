const mongoose = require("mongoose");

const escalationLogSchema = new mongoose.Schema({
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: "EscalationRule", required: true },
  triggerEvent: { type: String, required: true },
  affectedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  escalatedToUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: String,
  triggeredAt: { type: Date, default: Date.now },
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

escalationLogSchema.index({ affectedUserId: 1, triggeredAt: -1 });

module.exports = mongoose.model("EscalationLog", escalationLogSchema);
