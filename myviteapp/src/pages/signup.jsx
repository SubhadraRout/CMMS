import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./signup.css";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    const email = form.email;

// ❌ Check for uppercase letters
if (/[A-Z]/.test(email)) {
  alert("Email should not contain uppercase letters ❌");
  return;
}

    // ✅ EMAIL VALIDATION ADDED
    const emailRegex = /^[a-z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/;
if (!emailRegex.test(form.email)) {
  alert("Enter valid email (gmail/yahoo/outlook only) ❌");
  return;
}

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("cmms_user", JSON.stringify(data.user));
        alert("Signup successful ✅");
        window.location.href = "/";
      } else {
        alert(data.message);
      }

    } catch (err) {
      alert("Error signing up");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <Link to="/" className="back-arrow">←</Link>

        <h2>Sign Up</h2>

        <form onSubmit={handleSignup}>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          {/* ✅ FIXED TYPE */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit">Sign Up</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}