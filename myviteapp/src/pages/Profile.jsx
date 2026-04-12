import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("cmms_user"))
  );

  if (!user) {
    return <h2>Please login first</h2>;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const [photo, setPhoto] = useState("");

  // ✅ FETCH PROFILE (FIXED dependency)
  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/profile/${user._id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.username || "");
        setEmail(data.email || "");
        setDept(data.department || "");
        setPhoto(data.photo || "");
      });
  }, [user._id]); // ✅ IMPORTANT

  // ✅ PHOTO UPLOAD
  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ SAVE PROFILE (FIXED 🔥)
  const save = async () => {
    const res = await fetch(`http://localhost:5000/api/auth/profile/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: name,
        email,
        department: dept,
        photo,
      }),
    });

    const updatedUser = await res.json();

    if (res.ok) {
      // ✅ update localStorage
      localStorage.setItem("cmms_user", JSON.stringify(updatedUser));

      // ✅ update state (VERY IMPORTANT)
      setUser(updatedUser);
      setPhoto(updatedUser.photo);

      alert("✅ Profile saved successfully");
    } else {
      alert("❌ Save failed");
    }
  };

  // ✅ DELETE ACCOUNT
  const deleteAccount = async () => {
    const password = prompt("Enter password to delete account:");

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username: user.username, password })
    });

    if (!res.ok) {
      alert("Wrong password ❌");
      return;
    }

    const delRes = await fetch(`http://localhost:5000/api/auth/profile/${user._id}`, {
      method: "DELETE",
    });

    if (delRes.ok) {
      alert("✅ Account deleted successfully");
      localStorage.clear();
      navigate("/signup");
    } else {
      alert("❌ Delete failed");
    }
  };

  // ✅ DEACTIVATE
  const deactivate = async () => {
    const password = prompt("Enter password to deactivate:");

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username: user.username, password })
    });

    if (!res.ok) {
      alert("Wrong password ❌");
      return;
    }

    const deactRes = await fetch(`http://localhost:5000/api/auth/profile/${user._id}/deactivate`, {
      method: "PUT",
    });

    if (deactRes.ok) {
      alert("Account deactivated");
      localStorage.clear();
      navigate("/login");
    } else {
      alert("Deactivate failed");
    }
  };

  return (
    <div className="dash-wrap">
      <div className="dash-top">
        <div className="dash-title">
          <h2>My Profile</h2>
        </div>

        <button className="dash-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="dash-row">

        {/* LEFT PANEL */}
        <div className="dash-panel">
          <h3>Profile Photo</h3>

          <div className="profile-photo">
            {photo ? (
              <img src={photo} alt="profile" />
            ) : (
              <div className="photo-empty">No Photo</div>
            )}
          </div>

          <input type="file" accept="image/*" onChange={onPhotoChange} />
        </div>

        {/* RIGHT PANEL */}
        <div className="dash-panel">
          <h3>Details</h3>

          <div className="form-grid">
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
            <input value={dept} onChange={(e) => setDept(e.target.value)} />
          </div>

          <div className="dash-actions">

            <button className="dash-action-btn blue" onClick={save}>
              Save Profile
            </button>

            <button className="dash-action-btn red" onClick={deleteAccount}>
              Delete Account
            </button>

            {user.role === "technician" && (
              <button className="dash-action-btn orange" onClick={deactivate}>
                Deactivate Account
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}