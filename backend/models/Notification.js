import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: String,
  eventType: {
    type: String,
    default: "",
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Issue",
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  role: String, // admin / technician / user
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);