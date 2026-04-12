import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import issueRoutes from "./routes/issueRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

console.log("🚀 THIS SERVER FILE IS RUNNING");

const app = express();   // ✅ FIRST

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/notifications", notificationRoutes);

// test route
app.get("/hello", (req, res) => {
  res.send("Hello working");
});

// routes (ALL app.use should be here)
app.use("/api/issues", issueRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/auth", authRoutes);   // ✅ HERE (correct place)
// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB ERROR:", err));

// server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});