console.log("✅ AUTH ROUTES LOADED");
console.log("✅ AUTH ROUTES LOADED");
import express from "express";
import User from "../models/user.js";
import Issue from "../models/Issue.js"; // ✅ ADDED

const router = express.Router();

// ✅ SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // ✅ EMAIL VALIDATION ADDED
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      username,
      email,
      password,
      role,
      isDeleted: false,
    });

    await newUser.save();

    res.json({ message: "Signup successful", user: newUser });

  } catch (err) {
    res.status(500).json({ message: "Error signing up" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      user.isDeleted = false;
      await user.save();
    }

    res.json({ message: "Login successful", user });

  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// ✅ FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error updating password" });
  }
});

// ✅ GET PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// ✅ GET USERS
router.get("/users", async (req, res) => {
  try {
    const role = req.query.role;

    const users = await User.find({
      ...(role ? { role } : {}),
      isDeleted: false,
    }).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE PROFILE
router.put("/profile/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ✅ DELETE ACCOUNT
router.delete("/profile/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting account" });
  }
});

// ✅ DEACTIVATE
router.put("/profile/:id/deactivate", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error deactivating account" });
  }
});

// ✅ NOTIFICATIONS (ADDED)
router.get("/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Issue.find({
      $or: [
        { reportedBy: req.params.userId },
        { assignedTo: req.params.userId }
      ]
    })
    .populate("reportedBy", "username")
    .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

export default router;