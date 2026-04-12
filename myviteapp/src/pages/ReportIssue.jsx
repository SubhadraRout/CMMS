import React, { useMemo, useState } from "react";
import { addOrder } from "../utils/storage";
import { addNotification } from "../utils/notificationStorage";

import keyboardImg from "../assets/keyboard.png";
import mouseImg from "../assets/mouse.png";
import monitorImg from "../assets/monitor.png";
import pcImg from "../assets/pc.png";

const ISSUE_MAP = {
  keyboard: { label: "Keyboard Not Working", img: keyboardImg },
  mouse: { label: "Mouse Not Working", img: mouseImg },
  monitor: { label: "Monitor Issue", img: monitorImg },
  pc: { label: "System / PC Issue", img: pcImg },
};

export default function ReportIssue() {
  const [computerId, setComputerId] = useState("");
  const [department, setDepartment] = useState("");
  const [issueType, setIssueType] = useState("keyboard");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});

  const preview = useMemo(() => ISSUE_MAP[issueType], [issueType]);

  const validate = () => {
    const newErrors = {};

    const cid = computerId.trim();
    const dept = department.trim();
    const comm = comment.trim();

    const computerIdRegex = /^[A-Z]+-[A-Z]+-\d+$/;

    if (!cid) newErrors.computerId = "Computer ID is required";
    else if (!computerIdRegex.test(cid))
      newErrors.computerId = "Format should be like LAB-PC-12";

    if (!dept) newErrors.department = "Department is required";
    else if (dept.length < 3)
      newErrors.department = "Department must be at least 3 characters";

    if (!comm) newErrors.comment = "Comment is required";
    else if (comm.length < 10)
      newErrors.comment = "Comment must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 FIXED SUBMIT FUNCTION
  const submit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!computerId.trim()) errs.computerId = "Computer ID is required";
    if (!department.trim()) errs.department = "Department is required";
    if (!comment.trim()) errs.comment = "Description is required";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      // ✅ FIX: get full user from localStorage
      const user = JSON.parse(localStorage.getItem("cmms_user"));

      if (!user?._id) {
        alert("Login required ❌");
        return;
      }

      const res = await fetch("http://localhost:5000/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          computerId,
          department,
          issueType,
          description: comment,
          priority: "Medium",
          assignedTo: "Unassigned", // ✅ FIXED
          reportedBy: user._id,     // ✅ FIXED
        }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      alert("✅ Issue reported successfully!");

      addNotification({
        message: `Issue reported for ${computerId} (${issueType})`,
        time: new Date().toLocaleString(),
      });

      setComputerId("");
      setDepartment("");
      setComment("");
      setIssueType("keyboard");

    } catch (err) {
      console.error("ERROR:", err);
      alert("❌ Failed to submit issue");
    }
  };

  return (
    <div className="report-page">
      <h2 className="report-title">Report Maintenance Issue</h2>

      <div className="report-container">

        {/* LEFT FORM */}
        <form onSubmit={submit} className="report-form">

          <div className="form-group">
            <label>Computer ID</label>
            <input
              value={computerId}
              onChange={(e) => setComputerId(e.target.value.toUpperCase())}
              placeholder="LAB-PC-12"
              className={errors.computerId ? "input error" : "input"}
            />
            {errors.computerId && <ErrorText>{errors.computerId}</ErrorText>}
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="CSE Lab"
              className={errors.department ? "input error" : "input"}
            />
            {errors.department && <ErrorText>{errors.department}</ErrorText>}
          </div>

          <div className="form-group">
            <label>Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="input"
            >
              <option value="keyboard">Keyboard Not Working</option>
              <option value="mouse">Mouse Not Working</option>
              <option value="monitor">Monitor Issue</option>
              <option value="pc">System / PC Issue</option>
            </select>
          </div>

          <div className="form-group">
            <label>Problem Details</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              className={errors.comment ? "input error" : "input"}
            />
            {errors.comment && <ErrorText>{errors.comment}</ErrorText>}
          </div>

          <button type="submit" className="submit-btn">
            Submit Issue 🚀
          </button>

        </form>

        {/* RIGHT PREVIEW */}
        <div className="preview-card">
          <h3>Component Preview</h3>

          <img src={preview.img} alt={preview.label} />

          <p className="preview-label">{preview.label}</p>
        </div>

      </div>
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  margin: "8px 0 6px",
  outline: "none",
};

const getInputStyle = (error) => ({
  ...inputStyle,
  border: error ? "1px solid red" : "1px solid #ddd",
});

const btnStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#4b7bec",
  color: "white",
  width: "100%",
  marginTop: 10,
};

const ErrorText = ({ children }) => (
  <div style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
    {children}
  </div>
);