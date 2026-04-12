import express from "express";
import Notification from "../models/Notification.js";

console.log("✅ NOTIFICATION ROUTES LOADED");

const router = express.Router();

/* ✅ CREATE NOTIFICATION */
router.post("/", async (req, res) => {
  try {
    const { message, role } = req.body;

    const notif = new Notification({ message, role });
    await notif.save();

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ✅ GET BY ROLE (THIS IS MISSING 🔥) */
router.get("/:role", async (req, res) => {
  try {
    const role = req.params.role;

    const notifications = await Notification.find({ role })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;