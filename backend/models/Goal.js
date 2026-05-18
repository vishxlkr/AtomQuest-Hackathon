import mongoose from "mongoose";
import { UOM_TYPES, GOAL_STATUSES, PROGRESS_STATUSES, QUARTERS } from "../config/constants.js";

const quarterlySchema = new mongoose.Schema(
  {
    quarter: { type: String, enum: QUARTERS, required: true },
    plannedTarget: mongoose.Schema.Types.Mixed,
    actualAchievement: mongoose.Schema.Types.Mixed,
    progressStatus: { type: String, enum: PROGRESS_STATUSES, default: "not_started" },
    progressScore: Number,
    managerComment: String,
    updatedAt: Date
  },
  { _id: false }
);

const goalSchema = new mongoose.Schema(
  {
    goalSheetId: { type: mongoose.Schema.Types.ObjectId, ref: "GoalSheet", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    thrustArea: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: String,
    uomType: { type: String, enum: UOM_TYPES, required: true, index: true },
    target: { type: mongoose.Schema.Types.Mixed, required: true },
    weightage: { type: Number, required: true, min: 10, max: 100 },
    isShared: { type: Boolean, default: false, index: true },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sharedLinkId: { type: String, default: null, index: true },
    primaryOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: GOAL_STATUSES, default: "draft" },
    quarterly: { type: [quarterlySchema], default: [] }
  },
  { timestamps: true }
);

goalSchema.index({ title: "text", thrustArea: "text" });

export default mongoose.model("Goal", goalSchema);