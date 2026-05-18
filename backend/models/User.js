const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    authProvider: { type: String, enum: ["local", "azure"], default: "local" },
    password: {
      type: String,
      select: false,
      required: function requirePasswordForLocalUser() {
        return this.authProvider === "local";
      }
    },
    role: { type: String, enum: ROLES, default: "employee" },
    azureOid: { type: String, sparse: true, unique: true, trim: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ role: 1, department: 1, isActive: 1 });
userSchema.virtual("directReports", { ref: "User", localField: "_id", foreignField: "managerId" });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.password || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    employeeId: this.employeeId,
    name: this.name,
    email: this.email,
    role: this.role,
    authProvider: this.authProvider,
    department: this.department,
    managerId: this.managerId,
    isActive: this.isActive
  };
};

module.exports = mongoose.model("User", userSchema);
