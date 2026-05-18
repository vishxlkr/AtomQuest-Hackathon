import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { ensureEnvAdmin } from "./config/bootstrapAdmin.js";
import errorHandler from "./middleware/errorHandler.js";
import { startCronJobs } from "./utils/cronJobs.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import checkinRoutes from "./routes/checkin.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportRoutes from "./routes/report.routes.js";
import cycleRoutes from "./routes/cycle.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import escalationRoutes from "./routes/escalation.routes.js";

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [process.env.EMPLOYEE_PORTAL_URL, process.env.ADMIN_PORTAL_URL].filter(Boolean);

app.use(helmet());
app.use(cors({ origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"))), credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/v1", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true }));

app.get("/health", (req, res) => res.json({ success: true, service: "atomquest-api" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/checkin", checkinRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/cycles", cycleRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1", escalationRoutes);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(() => {
  ensureEnvAdmin()
    .then(() => {
      startCronJobs();
      app.listen(port, () => console.log(`AtomQuest API running on ${port}`));
    })
    .catch((err) => {
      console.error("Failed to bootstrap admin user", err);
      process.exit(1);
    });
}).catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

export default app;
