import express from "express";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { listEmployees } from "../controllers/user.controller.js";

const router = express.Router();
router.get("/employees", verifyToken, requireRole("manager", "admin"), listEmployees);

export default router;
