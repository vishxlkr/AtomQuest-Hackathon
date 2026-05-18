const express = require("express");
const ctrl = require("../controllers/escalation.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken, requireRole("admin"));

router.get("/escalations/rules", ctrl.getRules);
router.post("/escalations/rules", ctrl.createRule);
router.patch("/escalations/rules/:id", ctrl.updateRule);
router.delete("/escalations/rules/:id", ctrl.deleteRule);
router.get("/escalations/logs", ctrl.getEscalationLogs);
router.patch("/escalations/logs/:id/resolve", ctrl.resolveEscalation);

module.exports = router;
