import express from "express";
import { body } from "express-validator";
import * as ctrl from "../controllers/goal.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";

const router = express.Router();
const goalRules = [body("title").optional().notEmpty().trim().isLength({ max: 200 }), body("uomType").optional().isIn(["min", "max", "timeline", "zero"]), body("weightage").optional().isFloat({ min: 10, max: 100 })];

router.use(verifyToken);
router.post("/sheet/create", requireRole("employee"), ctrl.createGoalSheet);
router.get("/sheet/my", requireRole("employee"), ctrl.getMyGoalSheet);
router.post("/sheet/:sheetId/submit", requireRole("employee"), ctrl.submitGoalSheet);
router.get("/team/sheets", requireRole("manager", "admin"), ctrl.getTeamGoalSheets);
router.patch("/sheet/:sheetId/approve", requireRole("manager", "admin"), ctrl.approveGoalSheet);
router.patch("/sheet/:sheetId/return", requireRole("manager", "admin"), ctrl.returnGoalSheet);
router.post("/sheet/:sheetId/goals", requireRole("employee"), goalRules, validateRequest, ctrl.addGoal);
router.post("/shared/push", requireRole("manager", "admin"), [body("title").notEmpty().trim().isLength({ max: 200 }), body("uomType").isIn(["min", "max", "timeline", "zero"])], validateRequest, ctrl.pushSharedGoal);
router.post("/:goalId/shared/sync", ctrl.syncSharedGoalAchievement);

router.get("/sheets/mine", requireRole("employee"), ctrl.getOrCreateSheet);
router.post("/sheets/:sheetId/submit", requireRole("employee"), ctrl.submitGoalSheet);
router.get("/sheets/team", requireRole("manager"), ctrl.getTeamGoalSheets);
router.patch("/sheets/:sheetId/approve", requireRole("manager"), ctrl.approveGoalSheet);
router.patch("/sheets/:sheetId/return", requireRole("manager"), ctrl.returnGoalSheet);
router.post("/sheets/:sheetId/unlock", requireRole("admin"), ctrl.unlockSheet);
router.post("/goals", requireRole("employee"), goalRules, validateRequest, ctrl.addGoal);
router.patch("/goals/:goalId/manager", requireRole("manager"), goalRules, validateRequest, ctrl.managerUpdateGoal);
router.patch("/goals/:goalId/achievement", requireRole("employee"), ctrl.updateAchievement);
router.patch("/goals/:goalId", requireRole("employee", "admin"), goalRules, validateRequest, ctrl.updateGoal);
router.delete("/goals/:goalId", requireRole("employee", "admin"), ctrl.deleteGoal);
router.post("/goals/shared", requireRole("manager", "admin"), [body("title").notEmpty().trim().isLength({ max: 200 }), body("uomType").isIn(["min", "max", "timeline", "zero"])], validateRequest, ctrl.pushSharedGoal);

router.patch("/:goalId/manager", requireRole("manager"), goalRules, validateRequest, ctrl.managerUpdateGoal);
router.patch("/:goalId/achievement", requireRole("employee"), ctrl.updateAchievement);
router.patch("/:goalId", requireRole("employee", "admin"), goalRules, validateRequest, ctrl.updateGoal);
router.delete("/:goalId", requireRole("employee", "admin"), ctrl.deleteGoal);

export default router;
