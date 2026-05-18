import mongoose from "mongoose";

const escalationStageSchema = new mongoose.Schema(
  {
    target: { type: String, enum: ["employee", "manager", "skip_level", "hr", "admin", "custom"], required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    afterDays: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const escalationRuleSchema = new mongoose.Schema(
  {
    triggerEvent: { type: String, enum: ["GOAL_NOT_SUBMITTED", "GOAL_NOT_APPROVED", "CHECKIN_NOT_DONE"], required: true },
    thresholdDays: { type: Number, required: true, min: 1 },
    escalateTo: { type: String, enum: ["manager", "skip_level", "admin", "hr", "custom"] },
    escalationChain: { type: [escalationStageSchema], default: [] },
    isActive: { type: Boolean, default: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("EscalationRule", escalationRuleSchema);
