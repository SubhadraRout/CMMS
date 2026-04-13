import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import issueRoutes from "./routes/issueRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

console.log("🚀 THIS SERVER FILE IS RUNNING");

const app = express();   // ✅ FIRST

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/notifications", notificationRoutes);

// test route
app.get("/hello", (req, res) => {
  res.send("Hello working");
});

// routes (ALL app.use should be here)
app.use("/api/issues", issueRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/auth", authRoutes);   // ✅ HERE (correct place)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use (another server is probably still running).`);
        console.error(`   Find PID: netstat -ano | findstr :${PORT}`);
        console.error(`   Stop it:  taskkill /PID <pid> /F`);
        console.error(`   Or use another port: set PORT=5001 in .env`);
      } else {
        console.error("❌ Server listen error:", err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB ERROR:", err);
    process.exit(1);
  });