import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  computerId: {
    type: String,
    required: true,
  },

  department: {
    type: String,
    required: true,
  },

  issueType: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    default: "Pending",
  },

  priority: {
    type: String,
    default: "Medium",
  },

  assignedTo: {
    type: String,
    default: "Unassigned", // ✅ FIXED (important for dropdown)
  },

  // 🔥 QUOTATION SYSTEM
  estimation: {
    type: Number,
    default: 0,
  },

  quotationSent: {
    type: Boolean,
    default: false,
  },

  approved: {
    type: Boolean,
    default: false,
  },

  approvedBy: {
    type: String,
    default: null,
  },

  // ✅ OPTIONAL BUT VERY IMPORTANT (for future)
  completedAt: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Issue", issueSchema);