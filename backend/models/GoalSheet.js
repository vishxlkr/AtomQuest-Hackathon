const mongoose = require("mongoose");
const { APPROVAL_STATUSES } = require("../config/constants");

const goalSheetSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: "Cycle", required: true },
    totalWeightage: { type: Number, default: 0, min: 0, max: 100 },
    approvalStatus: { type: String, enum: APPROVAL_STATUSES, default: "draft", index: true },
    submittedAt: Date,
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    managerRemarks: String,
    isLocked: { type: Boolean, default: false, index: true },
    lockedAt: Date,
    unlockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

goalSheetSchema.index({ employeeId: 1, cycleId: 1 }, { unique: true });
goalSheetSchema.virtual("goals", { ref: "Goal", localField: "_id", foreignField: "goalSheetId" });

module.exports = mongoose.model("GoalSheet", goalSheetSchema);
