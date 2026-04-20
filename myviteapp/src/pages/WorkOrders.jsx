import React, { useEffect, useState } from "react";
import { apiUrl, resolveStoredUserId } from "../apiBase.js";
import "./WorkOrders.css";

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("cmms_user"));
  const userId = resolveStoredUserId(user);

  // ✅ Fetch from backend
  useEffect(() => {
    const fetchData = () => {
      if (!userId) {
        setOrders([]);
        return;
      }
      fetch(apiUrl(`/api/issues/user/${encodeURIComponent(userId)}`))
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setOrders(list);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  // ✅ Delete from backend
  const remove = async (id) => {
    await fetch(apiUrl(`/api/issues/${id}`), {
      method: "DELETE",
    });

    setOrders((prev) => prev.filter((o) => o._id !== id));
  };

  return (
    <div className="workorders-container">
      <h2>Work Orders</h2>

      {orders.length === 0 ? (
        <p>No work orders yet. Report an issue first.</p>
      ) : (
        <table className="workorders-table">
          <thead>
            <tr>
              <th>Computer</th>
              <th>Department</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.computerId}</td>
                <td>{o.department}</td>

                {/* ✅ ISSUE TYPE */}
                <td className="issue-text">
                  {o.issueType || "—"}
                </td>

                {/* ✅ STATUS BADGE */}
                <td>
                  <span
                    className={`status ${
                      (o.status || "pending")
                        .toLowerCase()
                        .replace(" ", "-")
                    }`}
                  >
                    {o.status || "Pending"}
                  </span>
                </td>

                <td>{o.priority}</td>

                <td>
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleString()
                    : "—"}
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => remove(o._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}