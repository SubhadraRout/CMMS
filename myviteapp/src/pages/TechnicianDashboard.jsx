import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

function StatCard({ title, value, sub }) {
  return (
    <div className="dash-card">
      <div className="dash-card-title">{title}</div>
      <div className="dash-card-value">{value}</div>
      {sub ? <div className="dash-card-sub">{sub}</div> : null}
    </div>
  );
}

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  // ✅ Fetch only assigned work (for now using all)
  useEffect(() => {
    fetch("http://localhost:5000/api/issues")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  // ✅ Protect route
  useEffect(() => {
    const storedUser = sessionStorage.getItem("cmms_user");
    if (!storedUser) return navigate("/login");

    const user = JSON.parse(storedUser);
    if (user.role !== "technician") navigate("/dashboard");
  }, [navigate]);

  const stats = useMemo(() => {
    const total = orders.length;

    const open = orders.filter(o => o.status === "Open").length;
    const pending = orders.filter(o => o.status === "Pending").length;
    const inProgress = orders.filter(o => o.status === "In Progress").length;
    const completed = orders.filter(o => o.status === "Completed").length;

    const priorityHigh = orders.filter(
      (o) => (o.priority || "").toLowerCase() === "high"
    ).length;

    const recent = [...orders].slice(0, 6);
    const healthScore = total === 0 ? 100 : Math.max(40, 100 - (pending + open) * 7);

    return { total, open, inProgress, completed, pending, priorityHigh, recent, healthScore };
  }, [orders]);

  return (
    <div className="dash-wrap">

      {/* 🔹 HEADER */}
      <div style={{
        background: "#e6f4ff",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h3 style={{ margin: 0 }}>🧑‍🔧 Technician Dashboard</h3>
          <small>Manage your assigned tasks and update work progress.</small>
        </div>

        <button className="dash-btn" onClick={() => navigate("/technician")}>
          Back to Technician Panel
        </button>
      </div>


      {/* 🔹 STATS */}
      <div className="dash-grid">
        <StatCard title="My Tasks" value={stats.total} sub="Assigned to you" />
        <StatCard title="Pending" value={stats.pending} sub="Waiting to start" />
        <StatCard title="In Progress" value={stats.inProgress} sub="Currently working" />
        <StatCard title="Completed" value={stats.completed} sub="Finished tasks" />
      </div>

      {/* 🔹 HEALTH */}
      <div className="dash-row">
        <div className="dash-panel">
          <h3>Work Efficiency</h3>
          <p className="muted">Based on your pending workload.</p>

          <div className="health-bar">
            <div className="health-fill" style={{ width: `${stats.healthScore}%` }} />
          </div>

          <div className="health-meta">
            <span>Score: <b>{stats.healthScore}</b>/100</span>
            <span>High Priority: <b>{stats.priorityHigh}</b></span>
          </div>
        </div>

        <div className="dash-panel">
          <h3>⚡ Alerts</h3>
          {stats.priorityHigh > 0 ? (
            <p className="pill high">High priority tasks assigned!</p>
          ) : (
            <p className="muted">No urgent tasks</p>
          )}
        </div>
      </div>

      {/* 🔹 RECENT TASKS */}
      <div className="dash-panel">
        <h3>My Recent Tasks</h3>

        {stats.recent.length === 0 ? (
          <div className="empty">No assigned work yet.</div>
        ) : (
          <div className="table">
            <div className="trow thead">
              <div>ID</div>
              <div>Issue</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Date</div>
            </div>

            {stats.recent.map((o) => (
              <div className="trow" key={o._id}>
                <div>{o._id?.slice(-5)}</div>
                <div className="t-title">{o.issueType || "Untitled"}</div>
                <div>
                  <span className={`pill ${String(o.status || "open").toLowerCase().replace(" ", "-")}`}>
                    {o.status || "Open"}
                  </span>
                </div>
                <div>{o.priority || "-"}</div>
                <div>{o.createdAt || "-"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}