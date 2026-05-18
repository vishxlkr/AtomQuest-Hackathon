const express = require("express");
const ctrl = require("../controllers/admin.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.get("/cycles/active", ctrl.getActiveCycle);
router.use(verifyToken, requireRole("admin"));
router.post("/cycles", ctrl.createCycle);
router.get("/cycles", ctrl.getCycles);
router.patch("/cycles/:id/activate", ctrl.activateCycle);
router.get("/users", ctrl.getAllUsers);
router.post("/users", ctrl.createUser);
router.patch("/users/:id", ctrl.updateUser);
router.patch("/users/:id/deactivate", ctrl.deactivateUser);
router.delete("/users/:id", ctrl.deleteUser);
router.patch("/goalsheets/:sheetId/unlock", ctrl.unlockGoalSheet);
router.get("/audit-logs", ctrl.getAuditLogs);
router.get("/dashboard", ctrl.getCompletionDashboard);
router.get("/org-hierarchy", ctrl.getOrgHierarchy);
router.get("/escalation-rules", ctrl.listEscalationRules);
router.post("/escalation-rules", ctrl.createEscalationRule);
router.patch("/escalation-rules/:id", ctrl.updateEscalationRule);
router.delete("/escalation-rules/:id", ctrl.deleteEscalationRule);
router.get("/escalation-logs", ctrl.listEscalationLogs);

module.exports = router;
