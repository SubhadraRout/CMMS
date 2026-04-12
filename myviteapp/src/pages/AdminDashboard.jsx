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

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/issues")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("cmms_user");
    if (!storedUser) return navigate("/login");

    const user = JSON.parse(storedUser);
    if (user.role !== "admin") navigate("/dashboard");
  }, [navigate]);

  const stats = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(o => o.status === "Pending").length;
    const inProgress = orders.filter(o => o.status === "In Progress").length;
    const completed = orders.filter(o => o.status === "Completed").length;

    const priorityHigh = orders.filter(
      (o) => (o.priority || "").toLowerCase() === "high"
    ).length;

    // ✅ NEW: quotation stats
    const quotationsPending = orders.filter(
      (o) => o.quotationSent && !o.approved
    ).length;

    const quotationsApproved = orders.filter(
      (o) => o.approved === true
    ).length;

    const recent = [...orders].slice(-6).reverse();

    const healthScore =
      total === 0 ? 100 : Math.max(30, 100 - (pending + quotationsPending) * 5);

    return {
      total,
      inProgress,
      completed,
      pending,
      priorityHigh,
      quotationsPending,
      quotationsApproved,
      recent,
      healthScore,
    };
  }, [orders]);

  return (
    <div className="dash-wrap">

      {/* HEADER */}
      <div style={{
        background: "#ffe8cc",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h3 style={{ margin: 0 }}>🛠 Admin Control Center</h3>
          <small>Manage technicians, approvals & system flow.</small>
        </div>

        <button className="dash-btn" onClick={() => navigate("/admin")}>
          Back to Admin Panel
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="dash-grid">
        <button className="dash-action-btn orange" onClick={() => navigate("/adminworkorders")}>
          Manage Orders
        </button>

        <button className="dash-action-btn blue" onClick={() => navigate("/admin-issues")}>
          View Issues
        </button>

        <button className="dash-action-btn blue">
          Assign Technician
        </button>

        <button className="dash-action-btn orange">
          Manage Users
        </button>
      </div>

      {/* STATS */}
      <div className="dash-grid">
        <StatCard title="Total Orders" value={stats.total} />
        <StatCard title="Pending" value={stats.pending} />
        <StatCard title="In Progress" value={stats.inProgress} />
        <StatCard title="Completed" value={stats.completed} />
      </div>

      {/* ✅ NEW QUOTATION STATS */}
      <div className="dash-grid">
        <StatCard title="Quotation Pending" value={stats.quotationsPending} />
        <StatCard title="Approved Quotations" value={stats.quotationsApproved} />
      </div>

      {/* HEALTH */}
      <div className="dash-row">
        <div className="dash-panel">
          <h3>System Health</h3>

          <div className="health-bar">
            <div
              className="health-fill"
              style={{ width: `${stats.healthScore}%` }}
            />
          </div>

          <div className="health-meta">
            <span>Score: <b>{stats.healthScore}</b>/100</span>
            <span>High Priority: <b>{stats.priorityHigh}</b></span>
          </div>
        </div>

        <div className="dash-panel">
          <h3>⚠ Alerts</h3>

          {stats.quotationsPending > 0 ? (
            <p className="pill high">
              {stats.quotationsPending} quotation(s) waiting approval
            </p>
          ) : stats.priorityHigh > 0 ? (
            <p className="pill high">
              High priority issues exist
            </p>
          ) : (
            <p className="muted">All systems normal</p>
          )}
        </div>
      </div>

      {/* RECENT TABLE */}
      <div className="dash-panel">
        <h3>Recent Work Orders</h3>

        {stats.recent.length === 0 ? (
          <div className="empty">No work orders</div>
        ) : (
          <div className="table">
            <div className="trow thead">
              <div>ID</div>
              <div>Issue</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Approval</div>
            </div>

            {stats.recent.map((o) => (
              <div className="trow" key={o._id}>
                <div>{o._id.slice(-5)}</div>
                <div>{o.issueType}</div>

                <div>
                  <span className={`pill ${String(o.status || "").toLowerCase().replace(" ", "-")}`}>
                    {o.status}
                  </span>
                </div>

                <div>{o.priority}</div>

                {/* ✅ SHOW ADMIN NAME */}
                <div>
                  {o.approved ? (
                    <span>Approved by {o.approvedBy || "Admin"} ✅</span>
                  ) : o.quotationSent ? (
                    <span>Waiting ⏳</span>
                  ) : (
                    "-"
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}