import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../utils/profileStorage";
import { apiUrl, resolveStoredUserId } from "../apiBase.js";
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("cmms_user"));
  const userId = resolveStoredUserId(user);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }
    fetch(apiUrl(`/api/issues/user/${encodeURIComponent(userId)}`))
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      });
  }, [userId]);
  const profile = getProfile();

  const stats = useMemo(() => {
    const total = orders.length;

    const byStatus = (s) =>
      orders.filter((o) => (o.status || "").toLowerCase() === s).length;

    const open = byStatus("open");
    const inProgress = byStatus("in progress") + byStatus("inprogress");
    const completed = byStatus("completed") + byStatus("closed");
    const pending = byStatus("pending");

    const priorityHigh = orders.filter(
      (o) => (o.priority || "").toLowerCase() === "high"
    ).length;

    const recent = [...orders].slice(0, 6);

    // simple health score (demo)
    const healthScore = total === 0 ? 100 : Math.max(35, 100 - (open + pending) * 8);

    return { total, open, inProgress, completed, pending, priorityHigh, recent, healthScore };
  }, [orders]);

  return (
    <div className="dash-wrap">
      <div className="dash-top">
        <div className="dash-title">
          <h2>Dashboard</h2>
          <p>Overview of maintenance requests and work order progress.</p>
        </div>

        <div className="dash-user">
          <div className="dash-avatar" onClick={() => navigate("/profile")} title="Open Profile">
            {profile?.photo ? (
              <img src={profile.photo} alt="profile" />
            ) : (
              <span>{(profile?.name || "U").slice(0, 1).toUpperCase()}</span>
            )}
          </div>

          <div>
            <div className="dash-user-name">{profile?.name || "User"}</div>
            <button className="dash-btn" onClick={() => navigate("/profile")}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="dash-grid">
        <StatCard title="Total Work Orders" value={stats.total} sub="Your reported requests" />
        <StatCard title="Open" value={stats.open} sub="Needs action" />
        <StatCard title="In Progress" value={stats.inProgress} sub="Currently being fixed" />
        <StatCard title="Completed" value={stats.completed} sub="Resolved/Closed" />
      </div>

      {/* HEALTH + QUICK ACTIONS */}
      <div className="dash-row">
        <div className="dash-panel">
          <h3>Maintenance Health</h3>
          <p className="muted">Quick indicator based on pending/open load (demo logic).</p>

          <div className="health-bar">
            <div className="health-fill" style={{ width: `${stats.healthScore}%` }} />
          </div>

          <div className="health-meta">
            <span>Score: <b>{stats.healthScore}</b>/100</span>
            <span>High Priority: <b>{stats.priorityHigh}</b></span>
          </div>

          <div className="dash-actions">
            <button className="dash-action-btn orange" onClick={() => navigate("/report")}>
              + Report Issue
            </button>
            <button className="dash-action-btn blue" onClick={() => navigate("/workorders")}>
              View Work Orders
            </button>
          </div>
        </div>

        <div className="dash-panel">
          <h3>Work Orders by Status</h3>
          <p className="muted">Counts from your localStorage data.</p>

          <div className="mini-bars">
            <div className="bar-row">
              <span>Open</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${stats.total ? (stats.open / stats.total) * 100 : 0}%` }} />
              </div>
              <b>{stats.open}</b>
            </div>

            <div className="bar-row">
              <span>In Progress</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${stats.total ? (stats.inProgress / stats.total) * 100 : 0}%` }} />
              </div>
              <b>{stats.inProgress}</b>
            </div>

            <div className="bar-row">
              <span>Completed</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }} />
              </div>
              <b>{stats.completed}</b>
            </div>

            <div className="bar-row">
              <span>Pending</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }} />
              </div>
              <b>{stats.pending}</b>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="dash-panel">
        <div className="dash-panel-head">
          <h3>Recent Work Orders</h3>
          <button className="dash-btn" onClick={() => navigate("/workorders")}>
            Open All
          </button>
        </div>

        {stats.recent.length === 0 ? (
          <div className="empty">
            No work orders found. Create one from <b>Report Issue</b>.
          </div>
        ) : (
          <div className="table">
            <div className="trow thead">
              <div>ID</div>
              <div>Title</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Date</div>
            </div>

            {stats.recent.map((o) => (
              <div className="trow" key={o.id}>
                <div>{o._id?.slice(-5)}</div>
                <div className="t-title">{o.title || o.issue || "Untitled"}</div>
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