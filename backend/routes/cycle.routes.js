const express = require("express");
const { verifyToken, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/admin.controller");

const router = express.Router();

router.get("/active", ctrl.getActiveCycle);
router.use(verifyToken);
router.get("/", requireRole("admin"), ctrl.getCycles);
router.post("/", requireRole("admin"), ctrl.createCycle);

module.exports = router;
