import React, { useEffect, useState } from "react";
import "./TechCompleted.css";

export default function TechCompleted() {
  const [orders, setOrders] = useState([]);

  const user = JSON.parse(sessionStorage.getItem("cmms_user"));

  useEffect(() => {
    fetch("http://localhost:5000/api/issues")
      .then((res) => res.json())
      .then((data) => {
        const completed = data.filter(
          (o) =>
            o.assignedTo === user.username &&
            o.status === "Completed"
        );
        setOrders(completed);
      });
  }, [user.username]);

  return (
  <div className="tech-container">
    <h2 className="tech-title">My Completed Work</h2>

    <div className="tech-card">
      {orders.length === 0 ? (
        <div className="empty">No completed work yet.</div>
      ) : (
        <table className="tech-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue</th>
              <th>Computer</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id.slice(-5)}</td>
                <td className="issue-text">{o.issueType}</td>
                <td>{o.computerId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
}