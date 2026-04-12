import React, { useEffect, useState } from "react";

export default function TechnicianWorkOrders() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("cmms_user"));

  useEffect(() => {
    fetch("http://localhost:5000/api/issues")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (o) =>
            o.assignedTo === user.username ||
            o.assignedTo === "all"
        );
        setOrders(filtered);
      });
  }, []);

  const updateStatus = async (id, newStatus) => {
    const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        completedAt: new Date(),
      }),
    });

    if (res.ok) {
      const updated = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? updated : o))
      );
    }
  };

  const updateEstimation = (id, value) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === id ? { ...o, estimation: value } : o
      )
    );
  };

  const sendQuotation = async (order) => {
    if (!order.estimation) {
      alert("Enter estimation ❌");
      return;
    }

    const res = await fetch(`http://localhost:5000/api/issues/${order._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estimation: order.estimation,
        quotationSent: true,
        status: "Pending Approval",
      }),
    });

    if (res.ok) {
      const updated = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? updated : o))
      );

      alert("✅ Sent");
    }
  };

  return (
    <div className="workorders-container">
      <h2>🧑‍🔧 My Assigned Work</h2>

      <div className="workorders-card">
        <table className="workorders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Computer</th>
              <th>Issue</th>
              <th>Description</th>
              <th>Status</th>
              <th>Estimation ₹</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7">No work</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  <td>{o._id.slice(-5)}</td>
                  <td>{o.computerId}</td>
                  <td>{o.issueType}</td>

                  <td>{o.description}</td>

                  <td>{o.status}</td>

                  <td>
                    <input
                      type="number"
                      value={o.estimation || ""}
                      onChange={(e) =>
                        updateEstimation(o._id, e.target.value)
                      }
                      disabled={o.quotationSent}
                    />
                  </td>

                  <td>
                    {!o.quotationSent ? (
                      <button onClick={() => sendQuotation(o)}>
                        Send
                      </button>
                    ) : !o.approved ? (
                      <span>Waiting ⏳</span>
                    ) : o.status !== "Completed" ? (
                      <button
                        onClick={() =>
                          updateStatus(o._id, "Completed")
                        }
                      >
                        Complete
                      </button>
                    ) : (
                      <span>✅ Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}