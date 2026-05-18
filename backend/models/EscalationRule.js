const mongoose = require("mongoose");

const escalationRuleSchema = new mongoose.Schema(
  {
    triggerEvent: { type: String, enum: ["GOAL_NOT_SUBMITTED", "GOAL_NOT_APPROVED", "CHECKIN_NOT_DONE"], required: true },
    thresholdDays: { type: Number, required: true, min: 1 },
    escalateTo: { type: String, enum: ["manager", "skip_level", "admin"], required: true },
    isActive: { type: Boolean, default: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EscalationRule", escalationRuleSchema);
