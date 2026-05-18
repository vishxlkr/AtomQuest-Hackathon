import mongoose from "mongoose";
import { QUARTERS } from "../config/constants.js";

const quarterSchema = new mongoose.Schema(
  {
    quarter: { type: String, enum: QUARTERS, required: true },
    windowOpen: { type: Date, required: true },
    windowClose: { type: Date, required: true }
  },
  { _id: false }
);

const cycleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true, index: true },
    goalSettingOpen: { type: Date, default: () => new Date(new Date().getFullYear(), 4, 1) },
    goalSettingClose: Date,
    quarters: { type: [quarterSchema], default: [] },
    isActive: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Cycle", cycleSchema);