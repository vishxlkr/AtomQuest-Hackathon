import mongoose from "mongoose";
import { QUARTERS } from "../config/constants.js";

const checkInSchema = new mongoose.Schema(
  {
    goalSheetId: { type: mongoose.Schema.Types.ObjectId, ref: "GoalSheet", index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: "Cycle", index: true },
    quarter: { type: String, enum: QUARTERS, required: true },
    checkInDate: { type: Date, default: Date.now },
    overallComment: String,
    goalUpdates: [{ goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" }, comment: String, managerNote: String }],
    isCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

checkInSchema.index({ goalSheetId: 1, quarter: 1 }, { unique: true });

export default mongoose.model("CheckIn", checkInSchema);