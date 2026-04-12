import express from "express";
import Issue from "../models/Issue.js";
console.log("✅ Issue routes loaded");
import Notification from "../models/Notification.js"; // ✅ already added

const router = express.Router();

// CREATE ISSUE
router.post("/", async (req, res) => {
  try {
    const {
      computerId,
      department,
      issueType,
      description,
      priority,
      assignedTo,
      reportedBy
    } = req.body;

    const issue = new Issue({
      computerId,
      department,
      issueType,
      description,
      priority,
      assignedTo,
      reportedBy,
    });

    await issue.save();

    // 🔔 ADD THIS (notifications)
    await Notification.create({
      message: `New issue reported: ${issue.issueType}`,
      role: "admin",
    });

    await Notification.create({
      message: `New task available`,
      role: "technician",
    });

    // ✅ RETURN POPULATED DATA
    const populated = await Issue.findById(issue._id)
      .populate("reportedBy", "username");

    res.json(populated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create issue" });
  }
});

// GET ALL ISSUES
router.get("/", async (req, res) => {
  const issues = await Issue.find()
    .populate("reportedBy", "username")
    .sort({ createdAt: -1 });

  res.json(issues);
});

// UPDATE ISSUE
router.put("/:id", async (req, res) => {

  const updated = await Issue.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  .populate("reportedBy", "username");

  // 🔔 ADD THIS
  await Notification.create({
    message: `Issue updated`,
    role: "admin",
  });

  res.json(updated);
});

// update priority
router.put("/:id/priority", async (req, res) => {
  const { priority } = req.body;

  const updated = await Issue.findByIdAndUpdate(
    req.params.id,
    { priority },
    { new: true }
  );

  res.json(updated);
});

// DELETE ISSUE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // 🔔 ADD THIS
    await Notification.create({
      message: `Issue deleted`,
      role: "admin",
    });

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting issue", error: err });
  }
});

export default router;