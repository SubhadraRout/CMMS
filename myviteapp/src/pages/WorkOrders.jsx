import React, { useEffect, useState } from "react";
import { apiUrl, resolveStoredUserId } from "../apiBase.js";

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("cmms_user"));
  const userId = resolveStoredUserId(user);

  // ✅ Fetch from backend
  useEffect(() => {
  const fetchData = () => {
    if (!userId) {
      setOrders([]);
      return;
    }
    fetch(apiUrl(`/api/issues/user/${encodeURIComponent(userId)}`))
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setOrders(list);
      });
  };

  fetchData();
  const interval = setInterval(fetchData, 3000); // every 3 sec

  return () => clearInterval(interval);
}, [userId]);
  // ✅ Delete from backend
  const remove = async (id) => {
    await fetch(apiUrl(`/api/issues/${id}`), {
      method: "DELETE",
    });

    // update UI
    setOrders((prev) => prev.filter((o) => o._id !== id));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Work Orders</h2>

      <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
        {orders.length === 0 ? (
          <p style={{ color: "#666" }}>
            No work orders yet. Report an issue first.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Computer</th>
                <th style={th}>Department</th>
                <th style={th}>Issue</th>
                <th style={th}>Status</th>
                <th style={th}>Priority</th>
                <th style={th}>Date & Time</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={td}>{o.computerId}</td>
                  <td style={td}>{o.department}</td>
                  <td style={td}>{o.issueType}</td>
                  <td style={td}>{o.status}</td>
                  <td style={td}>{o.priority}</td>
                  <td style={td}>{o.createdAt? new Date(o.createdAt).toLocaleString(): "—"}</td>

                  <td style={td}>
                    <button
                      onClick={() => remove(o._id)}
                      style={dangerBtn}
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
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: 10,
  borderBottom: "1px solid #eee",
};

const td = {
  padding: 10,
  borderBottom: "1px solid #eee",
};

const dangerBtn = {
  background: "#ff4d4f",
  border: "none",
  color: "#fff",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
};