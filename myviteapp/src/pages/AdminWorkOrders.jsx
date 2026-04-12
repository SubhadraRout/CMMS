import React, { useEffect, useState } from "react";

export default function AdminWorkOrders() {
  const [orders, setOrders] = useState([]);
  const [editedOrders, setEditedOrders] = useState({});
  const [technicians, setTechnicians] = useState([]);

  const user = JSON.parse(localStorage.getItem("cmms_user"));

  // ✅ FETCH ORDERS
  useEffect(() => {
    fetch("http://localhost:5000/api/issues")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  // ✅ FETCH TECHNICIANS (FIXED)
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/users?role=technician")
      .then((res) => res.json())
      .then((data) => {
        console.log("TECH LIST:", data);
        setTechnicians(Array.isArray(data) ? data : []);
      })
      .catch(() => setTechnicians([]));
  }, []);

  // ✅ HANDLE CHANGE
  const handleChange = (id, field, value) => {
    setEditedOrders((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // ✅ SEND TASK
  const sendAssignment = async (id) => {
    const updates = editedOrders[id];

    if (!updates || !updates.assignedTo) {
      alert("Select technician first ❌");
      return;
    }

    const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updates,
        status: "Assigned",
      }),
    });

    if (res.ok) {
      const updated = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? updated : o))
      );

      alert("✅ Task sent");
    }
  };

  // ✅ APPROVE
  const approveQuotation = async (id) => {
    const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approved: true,
        status: "In Progress",
        approvedBy: user.username,
      }),
    });

    if (res.ok) {
      const updated = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? updated : o))
      );

      alert("✅ Approved");
    }
  };

  return (
    <div className="workorders-container">
      <h2>📋 Manage Work Orders</h2>

      <div className="workorders-card">
        <table className="workorders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Computer</th>
              <th>Issue</th>
              <th>Description</th>
              <th>Reported By</th>
              <th>Technician</th>
              <th>Estimation ₹</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Approval</th>
              <th>Send</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id.slice(-5)}</td>
                <td>{o.computerId}</td>
                <td>{o.issueType}</td>

                <td>{o.description}</td>

                {/* ✅ FIXED NAME */}
                <td>{o.reportedBy?.username || "Unknown"}</td>

                {/* ✅ FIXED DROPDOWN */}
                <td>
                  <select
                    value={
                      editedOrders[o._id]?.assignedTo ??
                      o.assignedTo ??
                      "Unassigned"
                    }
                    onChange={(e) =>
                      handleChange(o._id, "assignedTo", e.target.value)
                    }
                  >
                    <option value="Unassigned">Unassigned</option>
                    <option value="all">All Technicians</option>

                    {technicians.length > 0 ? (
                      technicians.map((tech) => (
                        <option key={tech._id} value={tech.username}>
                          {tech.username}
                        </option>
                      ))
                    ) : (
                      <option disabled>No technicians</option>
                    )}
                  </select>
                </td>

                {/* ✅ FIXED ESTIMATION */}
                <td>₹ {Number(o.estimation || 0)}</td>

                <td>{o.status}</td>

                <td>
                  <select
                    value={
                      editedOrders[o._id]?.priority ||
                      o.priority ||
                      "Medium"
                    }
                    onChange={(e) =>
                      handleChange(o._id, "priority", e.target.value)
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </td>

                <td>
                  {!o.quotationSent ? (
                    <span>Not Sent</span>
                  ) : !o.approved ? (
                    <button onClick={() => approveQuotation(o._id)}>
                      Approve
                    </button>
                  ) : (
                    <span>✅ Approved</span>
                  )}
                </td>

                <td>
                  <button
                    className="save-btn"
                    onClick={() => sendAssignment(o._id)}
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}