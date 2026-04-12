import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,        // ✅ FIX: required
    trim: true,
  },

  email: {
    type: String,
    required: true,        // ✅ FIX
    unique: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,        // ✅ FIX
  },

  role: {
    type: String,
    enum: ["user", "admin", "technician"],
    default: "user",
  },

  // ✅ FIX: remove duplicate + clean structure
  department: {
    type: String,
    default: "",
  },

  photo: {
    type: String,
    default: "",
  },

  // ✅ important for soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true }); // ✅ ADD THIS (important for consistency)

const User = mongoose.model("User", userSchema);

export default User;