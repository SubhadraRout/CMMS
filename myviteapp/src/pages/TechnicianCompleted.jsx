import React, { useEffect, useState } from "react";

export default function TechnicianCompleted() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("cmms_user"));

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
  }, []);

  return (
    <div className="workorders-container">
      <h2>✅ Completed Works</h2>

      <div className="workorders-card">
        <table className="workorders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Computer</th>
              <th>Issue</th>
              <th>Estimation (₹)</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="4">No completed work</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  <td>{o._id.slice(-5)}</td>
                  <td>{o.computerId}</td>
                  <td>{o.issueType}</td>
                  <td>{o.estimation || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}