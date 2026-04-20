import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ UPDATED LOGIN (BACKEND BASED)
  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        const user = data.user;

        sessionStorage.setItem("cmms_user", JSON.stringify(user));

        // 👇 NEW LINE ADDED
        sessionStorage.setItem("userId", user._id);

        // ✅ use navigate (NOT window.location)
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "technician") {
          navigate("/technician");
        } else {
          navigate("/");
        }

      } else {
        alert(data.message || "Invalid credentials ❌");
      }

    } catch (err) {
      alert("Server error ❌");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <a href="/" className="back-arrow">←</a>

        <h2>Sign In</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Sign In</button>

        {/* ✅ FORGOT PASSWORD */}
        <p>
          <a href="/forgot-password">Forgot Password?</a>
        </p>

        <p className="login-note">
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;