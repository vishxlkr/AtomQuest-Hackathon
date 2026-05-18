import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import * as ctrl from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/active", ctrl.getActiveCycle);
router.use(verifyToken);
router.get("/", requireRole("admin"), ctrl.getCycles);
router.post("/", requireRole("admin"), ctrl.createCycle);

export default router;
