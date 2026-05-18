const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, refreshToken, logout, getMe, getAzureLoginUrl, handleAzureCallback } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true });
const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true });
const emailRule = body("email").isEmail().normalizeEmail();
const registerRules = [
  emailRule,
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("department").optional({ values: "falsy" }).trim()
];
const loginRules = [
  emailRule,
  body("password").isString().notEmpty().withMessage("Enter your password")
];

router.post("/register", registerRules, validateRequest, register);
router.post("/login", loginLimiter, loginRules, validateRequest, login);
router.post("/refresh", refreshLimiter, refreshToken);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);
router.get("/azure/login", getAzureLoginUrl);
router.get("/azure/callback", handleAzureCallback);

module.exports = router;
