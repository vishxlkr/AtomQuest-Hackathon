import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Cycle from "../models/Cycle.js";
import GoalSheet from "../models/GoalSheet.js";
import Goal from "../models/Goal.js";
import AuditLog from "../models/AuditLog.js";
import CheckIn from "../models/CheckIn.js";
import Notification from "../models/Notification.js";
import EscalationRule from "../models/EscalationRule.js";
import EscalationLog from "../models/EscalationLog.js";

async function seed() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Cycle.deleteMany({}),
    GoalSheet.deleteMany({}),
    Goal.deleteMany({}),
    AuditLog.deleteMany({}),
    CheckIn.deleteMany({}),
    Notification.deleteMany({}),
    EscalationRule.deleteMany({}),
    EscalationLog.deleteMany({})
  ]);
  const admin = await User.create({ employeeId: "ADM001", name: "Admin User", email: "admin@atomquest.com", password: "Admin@123", role: "admin", department: "HR" });
  const manager = await User.create({ employeeId: "MGR001", name: "Priya Sharma", email: "manager@atomquest.com", password: "Manager@123", role: "manager", department: "Engineering" });
  await User.create({ employeeId: "EMP001", name: "Arjun Mehta", email: "employee@atomquest.com", password: "Employee@123", role: "employee", department: "Engineering", managerId: manager._id });
  await User.create({ employeeId: "EMP002", name: "Sneha Patel", email: "employee2@atomquest.com", password: "Employee@123", role: "employee", department: "Engineering", managerId: manager._id });
  await Cycle.create({
    name: "FY 2025-26",
    year: 2025,
    goalSettingOpen: new Date("2025-05-01"),
    goalSettingClose: new Date("2025-06-30"),
    isActive: true,
    createdBy: admin._id,
    quarters: [
      { quarter: "Q1", windowOpen: new Date("2025-07-01"), windowClose: new Date("2025-07-31") },
      { quarter: "Q2", windowOpen: new Date("2025-10-01"), windowClose: new Date("2025-10-31") },
      { quarter: "Q3", windowOpen: new Date("2026-01-01"), windowClose: new Date("2026-01-31") },
      { quarter: "Q4", windowOpen: new Date("2026-03-01"), windowClose: new Date("2026-04-30") }
    ]
  });
  console.log("Seed complete. Login credentials:");
  console.log("Admin:    admin@atomquest.com / Admin@123");
  console.log("Manager:  manager@atomquest.com / Manager@123");
  console.log("Employee: employee@atomquest.com / Employee@123");
  console.log("Employee2: employee2@atomquest.com / Employee@123");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
