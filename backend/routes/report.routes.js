const express = require("express");
const ctrl = require("../controllers/report.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken);
router.get("/completion-dashboard", requireRole("manager", "admin"), ctrl.getCompletionDashboard);
router.get("/achievement", requireRole("manager", "admin"), ctrl.getAchievementReport);
router.get("/export-csv", requireRole("manager", "admin"), ctrl.exportAchievementCSV);
router.get("/analytics", requireRole("admin"), ctrl.getAnalyticsOverview);
router.get("/analytics/qoq-trend", requireRole("manager", "admin"), ctrl.getQoQTrend);
router.get("/analytics/goal-distribution", requireRole("manager", "admin"), ctrl.getGoalDistribution);
router.get("/analytics/heatmap", requireRole("admin"), ctrl.getDepartmentHeatmap);
router.get("/analytics/managers", requireRole("admin"), ctrl.getManagerEffectiveness);
router.get("/goal-distribution", requireRole("manager", "admin"), ctrl.getGoalDistribution);
router.get("/manager-effectiveness", requireRole("admin"), ctrl.getManagerEffectiveness);

module.exports = router;
