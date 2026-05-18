const express = require("express");
const { body } = require("express-validator");
const ctrl = require("../controllers/checkin.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const { enforceQuarterWindow } = require("../middleware/quarterWindow");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();
router.use(verifyToken);
router.patch("/quarterly", requireRole("employee"), enforceQuarterWindow, [body("goalId").optional().isMongoId(), body("items").optional().isArray()], validateRequest, ctrl.updateQuarterlyAchievement);
router.get("/progress", requireRole("employee"), ctrl.getQuarterlyProgress);
router.post("/conduct", requireRole("manager", "admin"), ctrl.conductCheckIn);
router.post("/:sheetId/conduct", requireRole("manager", "admin"), ctrl.conductCheckIn);
router.get("/:sheetId/history", ctrl.getCheckInHistory);
router.get("/team/status", requireRole("manager", "admin"), ctrl.getTeamCheckInStatus);

module.exports = router;
