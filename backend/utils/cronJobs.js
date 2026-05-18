import cron from "node-cron";
import Cycle from "../models/Cycle.js";
import User from "../models/User.js";
import GoalSheet from "../models/GoalSheet.js";
import CheckIn from "../models/CheckIn.js";
import { createNotification } from "./notificationService.js";
import { sendCheckInReminderEmail } from "./emailService.js";
import { sendCheckInDueTeams } from "./teamsNotifier.js";
import { runEscalations } from "./escalationRunner.js";

async function goalSettingReminders() {
  const cycle = await Cycle.findOne({ isActive: true });
  if (!cycle) return;
  const now = new Date();
  if (!(now >= cycle.goalSettingOpen && now <= cycle.goalSettingClose)) return;
  const employees = await User.find({ role: "employee", isActive: true });
  for (const employee of employees) {
    const sheet = await GoalSheet.findOne({ employeeId: employee._id, cycleId: cycle._id, approvalStatus: { $in: ["submitted", "approved"] } });
    if (!sheet) await createNotification(employee._id, "GOAL_REMINDER", "Submit your goals", "Goal-setting window is open.", "/goals");
  }
}

async function checkInReminders() {
  const cycle = await Cycle.findOne({ isActive: true });
  if (!cycle) return;
  const now = new Date();
  const q = cycle.quarters.find((item) => now >= item.windowOpen && now <= item.windowClose);
  if (!q) return;

  const employees = await User.find({ role: "employee", isActive: true }).select("name email");
  for (const employee of employees) {
    const sheet = await GoalSheet.findOne({ employeeId: employee._id, cycleId: cycle._id, isLocked: true });
    if (!sheet) continue;

    const hasCheckIn = await CheckIn.findOne({
      employeeId: employee._id,
      cycleId: cycle._id,
      quarter: q.quarter,
      isCompleted: true
    });

    if (!hasCheckIn) {
      await createNotification(employee._id, "CHECKIN_REMINDER", `${q.quarter} check-in window`, "Please log your quarterly achievements before the window closes.", "/checkin");
      await sendCheckInReminderEmail({
        userEmail: employee.email,
        userName: employee.name,
        quarter: q.quarter,
        windowCloseDate: q.windowClose,
        isManager: false
      });
    }
  }
  console.log(`[Cron] Check-in reminders sent for ${q.quarter}`);
  const managers = await User.find({ role: "manager", isActive: true }).select("name");
  for (const manager of managers) {
    const team = await User.find({ role: "employee", managerId: manager._id, isActive: true }).select("_id");
    const done = await CheckIn.countDocuments({ managerId: manager._id, cycleId: cycle._id, quarter: q.quarter, isCompleted: true });
    const pending = Math.max(0, team.length - done);
    if (pending > 0) await sendCheckInDueTeams(manager.name, pending, q.quarter);
  }
}

function startCronJobs() {
  cron.schedule("0 9 * * *", async () => {
    await goalSettingReminders();
    await checkInReminders();
    await runEscalations();
  });
  cron.schedule("0 18 * * 5", async () => {
    console.log("[Cron] Weekly digest placeholder");
  });
  console.log("Cron jobs started");
}

export { startCronJobs, goalSettingReminders, checkInReminders, runEscalations };