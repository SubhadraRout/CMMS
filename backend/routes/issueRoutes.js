import express from "express";
import mongoose from "mongoose";
import Issue from "../models/Issue.js";
console.log("✅ Issue routes loaded");
import Notification from "../models/Notification.js"; // ✅ already added

const router = express.Router();
const DEDUPE_WINDOW_MS = 30 * 1000;

async function createNotificationOnce({
  message,
  role,
  userId = null,
  issueId = null,
  eventType = "",
}) {
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
  const existing = await Notification.findOne({
    role,
    userId,
    issueId,
    eventType,
    message,
    createdAt: { $gte: since },
  });

  if (existing) return existing;

  return Notification.create({
    message,
    role,
    userId,
    issueId,
    eventType,
  });
}

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
    await createNotificationOnce({
      message: `New issue reported: ${issue.issueType} (${issue.computerId})`,
      role: "admin",
      issueId: issue._id,
      eventType: "issue_reported_admin",
    });

    await createNotificationOnce({
      message: `New task available`,
      role: "technician",
      issueId: issue._id,
      eventType: "issue_reported_technician",
    });

    await createNotificationOnce({
      message: `Your issue was submitted: ${issue.issueType} (${issue.computerId})`,
      role: "user",
      userId: reportedBy,
      issueId: issue._id,
      eventType: "issue_reported_user",
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

// GET ISSUES FOR ONE USER (reported by this user only)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const issues = await Issue.find({ reportedBy: userId })
      .populate("reportedBy", "username")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user issues", error: err.message });
  }
});

// UPDATE ISSUE
router.put("/:id", async (req, res) => {
  try {
    const before = await Issue.findById(req.params.id).populate("reportedBy", "username");
    if (!before) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("reportedBy", "username");

    const reporterId = updated?.reportedBy?._id || before?.reportedBy?._id || null;
    const issueId = updated._id;

    const assignmentChanged = before.assignedTo !== updated.assignedTo;
    const statusChanged = before.status !== updated.status;
    const quotationSentNow = !before.quotationSent && updated.quotationSent;
    const approvedNow = !before.approved && updated.approved;
    const estimationChanged = Number(before.estimation || 0) !== Number(updated.estimation || 0);

    if (assignmentChanged && updated.assignedTo && updated.assignedTo !== "Unassigned") {
      await createNotificationOnce({
        message: `New task assigned`,
        role: "technician",
        issueId,
        eventType: "issue_assigned_technician",
      });
    }

    if (quotationSentNow || estimationChanged) {
      await createNotificationOnce({
        message: `Estimation sent: Rs ${updated.estimation || 0} for ${updated.issueType}.`,
        role: "admin",
        issueId,
        eventType: "quotation_sent_admin",
      });
    }

    if (approvedNow) {
      await createNotificationOnce({
        message: `Quotation approved for ${updated.issueType}. Start work.`,
        role: "technician",
        issueId,
        eventType: "quotation_approved_technician",
      });
    }

    if (statusChanged) {
      if (updated.status === "In Progress" && reporterId) {
        await createNotificationOnce({
          message: `Your issue is now in progress.`,
          role: "user",
          userId: reporterId,
          issueId,
          eventType: "issue_in_progress_user",
        });
      }

      if (updated.status === "Completed") {
        await createNotificationOnce({
          message: `Issue completed by technician: ${updated.issueType} (${updated.computerId}).`,
          role: "admin",
          issueId,
          eventType: "issue_completed_admin",
        });
        if (reporterId) {
          await createNotificationOnce({
            message: `Your issue is completed: ${updated.issueType}.`,
            role: "user",
            userId: reporterId,
            issueId,
            eventType: "issue_completed_user",
          });
        }
      }
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update issue" });
  }
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
    await createNotificationOnce({
      message: `Issue deleted`,
      role: "admin",
      issueId: deleted._id,
      eventType: "issue_deleted_admin",
    });

    if (deleted.reportedBy) {
      await createNotificationOnce({
        message: `Your issue (${deleted.issueType}) was closed/deleted by admin.`,
        role: "user",
        userId: deleted.reportedBy,
        issueId: deleted._id,
        eventType: "issue_deleted_user",
      });
    }

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting issue", error: err });
  }
});

export default router;