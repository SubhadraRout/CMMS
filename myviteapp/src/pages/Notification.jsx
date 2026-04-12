import React, { useEffect, useState } from "react";

export default function Notification() {
  const user = JSON.parse(localStorage.getItem("cmms_user"));
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/notifications/${user.role}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Notifications</h2>

      {data.length === 0 ? (
        <p>No notifications</p>
      ) : (
        data.map(n => (
          <div key={n._id} style={{
            padding: 10,
            marginBottom: 10,
            background: n.read ? "#eee" : "#cce5ff"
          }}>
            {n.message}
          </div>
        ))
      )}
    </div>
  );
}