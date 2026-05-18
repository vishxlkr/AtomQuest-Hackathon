import express from "express";
import { body } from "express-validator";
import * as ctrl from "../controllers/checkin.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { enforceQuarterWindow } from "../middleware/quarterWindow.js";
import { validateRequest } from "../middleware/validate.js";

const router = express.Router();
router.use(verifyToken);
router.patch("/quarterly", requireRole("employee"), enforceQuarterWindow, [body("goalId").optional().isMongoId(), body("items").optional().isArray()], validateRequest, ctrl.updateQuarterlyAchievement);
router.get("/progress", requireRole("employee"), ctrl.getQuarterlyProgress);
router.post("/conduct", requireRole("manager", "admin"), ctrl.conductCheckIn);
router.post("/:sheetId/conduct", requireRole("manager", "admin"), ctrl.conductCheckIn);
router.get("/:sheetId/history", ctrl.getCheckInHistory);
router.get("/team/status", requireRole("manager", "admin"), ctrl.getTeamCheckInStatus);

export default router;
