import express from "express";
import * as ctrl from "../controllers/escalation.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(verifyToken, requireRole("admin", "hr"));

router.get("/escalations/rules", ctrl.getRules);
router.get("/escalations/users", ctrl.getEscalationUsers);
router.post("/escalations/rules", ctrl.createRule);
router.patch("/escalations/rules/:id", ctrl.updateRule);
router.delete("/escalations/rules/:id", ctrl.deleteRule);
router.get("/escalations/logs", ctrl.getEscalationLogs);
router.patch("/escalations/logs/:id/resolve", ctrl.resolveEscalation);

export default router;
