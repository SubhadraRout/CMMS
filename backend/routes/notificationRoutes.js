import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/user.js";

console.log("✅ NOTIFICATION ROUTES LOADED");

const router = express.Router();

/* ✅ LIST FOR LOGGED-IN USER (personal + role broadcast) */
router.get("/for-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "invalid user id" });
    }
    const u = await User.findById(userId);
    if (!u) {
      return res.status(404).json({ error: "user not found" });
    }
    const uid = new mongoose.Types.ObjectId(userId);
    const notifications = await Notification.find({
      $or: [
        { userId: uid },
        {
          role: u.role,
          $or: [{ userId: null }, { userId: { $exists: false } }],
        },
      ],
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.patch("/mark-all-read", async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "invalid user id" });
      }
      const u = await User.findById(userId);
      if (!u) {
        return res.status(404).json({ error: "user not found" });
      }
      const r = u.role;
      const uid = new mongoose.Types.ObjectId(userId);
      await Notification.updateMany(
        {
          read: false,
          $or: [
            { userId: uid },
            {
              role: r,
              $or: [{ userId: null }, { userId: { $exists: false } }],
            },
          ],
        },
        { $set: { read: true } },
      );
      return res.json({ ok: true });
    }

    if (role) {
      await Notification.updateMany({ role, read: false }, { $set: { read: true } });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "userId or role required" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid notification id" });
    }
    const doc = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!doc) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(doc);
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