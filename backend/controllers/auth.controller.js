const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { getMsalClient } = require("../config/azureAD");
const { generateUserId } = require("../utils/userIdGenerator");

function signAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
}

function signRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, "EMAIL_EXISTS", "Email already exists");
  const employeeId = await generateUserId("employee");
  const payload = { employeeId, name, email, password, authProvider: "local", role: "employee", managerId: null };
  if (department) payload.department = department;
  const user = await User.create(payload);
  res.status(201).json({ success: true, data: user.toSafeObject() });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !user.isActive) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  if (user.authProvider === "azure") throw new ApiError(401, "MICROSOFT_LOGIN_REQUIRED", "Please sign in with Microsoft");
  if (!(await user.comparePassword(req.body.password))) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();
  setRefreshCookie(res, refreshToken);
  const safeUser = user.toSafeObject();
  res.json({ success: true, accessToken, user: safeUser, data: { accessToken, user: safeUser } });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "NO_REFRESH_TOKEN", "Refresh token is required");
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || !user.refreshToken || !(await bcrypt.compare(token, user.refreshToken))) {
    throw new ApiError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }
  const accessToken = signAccessToken(user);
  res.json({ success: true, accessToken, data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: "" } });
    } catch (_) {}
  }
  res.clearCookie("refreshToken");
  res.json({ success: true });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
});

const getAzureLoginUrl = asyncHandler(async (req, res) => {
  if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET || !process.env.AZURE_REDIRECT_URI) {
    return res.status(503).json({ success: false, error: { code: "AZURE_NOT_CONFIGURED", message: "SSO available in production environment" } });
  }
  const portal = ["admin", "employee"].includes(req.query.portal) ? req.query.portal : "employee";
  const prompt = ["login", "select_account", "consent"].includes(req.query.prompt) ? req.query.prompt : "select_account";
  const authUrl = await getMsalClient().getAuthCodeUrl({
    scopes: ["openid", "profile", "email", "User.Read"],
    redirectUri: process.env.AZURE_REDIRECT_URI,
    state: portal,
    prompt
  });
  res.json({ success: true, data: { authUrl }, authUrl });
});

function getPortalBase(portal) {
  return portal === "admin" ? process.env.ADMIN_PORTAL_URL : process.env.EMPLOYEE_PORTAL_URL;
}

function redirectAzureError(res, portal, message) {
  const portalBase = getPortalBase(portal);
  const params = new URLSearchParams({ message });
  return res.redirect(`${portalBase}/login?${params.toString()}`);
}

const handleAzureCallback = asyncHandler(async (req, res) => {
  if (!req.query.code) throw new ApiError(400, "CODE_REQUIRED", "Azure authorization code is required");
  const requestedPortal = ["admin", "employee"].includes(req.query.state) ? req.query.state : "employee";
  const tokenResponse = await getMsalClient().acquireTokenByCode({
    code: req.query.code,
    scopes: ["openid", "profile", "email", "User.Read"],
    redirectUri: process.env.AZURE_REDIRECT_URI
  });
  const account = tokenResponse.account;
  const email = account.username;
  const name = account.name || email.split("@")[0];
  const azureOid = account.localAccountId || account.homeAccountId;

  let user = await User.findOne({ $or: [{ email }, { azureOid }] }).select("+password");
  if (!user && requestedPortal === "admin") {
    return redirectAzureError(res, "admin", "This Microsoft account is not an admin in AtomQuest.");
  }
  if (user) {
    if (!user.isActive) {
      return redirectAzureError(res, requestedPortal, "This account is inactive or has been removed.");
    }
    user.name = name;
    user.azureOid = user.azureOid || azureOid;
    if (!user.password) user.authProvider = "azure";
    await user.save();
  } else {
    const employeeId = await generateUserId("employee");
    user = await User.create({
      name,
      email,
      employeeId,
      authProvider: "azure",
      role: "employee",
      azureOid
    });
  }

  if (requestedPortal === "admin" && user.role !== "admin") {
    return redirectAzureError(res, "admin", "Use the employee portal for this Microsoft account.");
  }
  if (requestedPortal === "employee" && !["employee", "manager"].includes(user.role)) {
    return redirectAzureError(res, "employee", "Use the admin portal for this Microsoft account.");
  }

  const accessToken = signAccessToken(user);
  const refreshTokenValue = signRefreshToken(user);
  user.refreshToken = await bcrypt.hash(refreshTokenValue, 10);
  await user.save();
  setRefreshCookie(res, refreshTokenValue);
  const portalBase = getPortalBase(requestedPortal);
  res.redirect(`${portalBase}/auth/callback?token=${encodeURIComponent(accessToken)}`);
});

module.exports = { register, login, refreshToken, logout, getMe, getAzureLoginUrl, handleAzureCallback };
