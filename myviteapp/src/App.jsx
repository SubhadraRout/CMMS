import React from "react";
import { Routes, Route, Link, useNavigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

import "./App.css";

import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";

import ReportIssue from "./pages/ReportIssue.jsx";
import WorkOrders from "./pages/WorkOrders.jsx";
import ForgotPassword from "./pages/ForgotPassword";

import NotificationBell from "./components/NotificationBell.jsx";


import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Help from "./pages/Help.jsx";
import Privacy from "./pages/Privacy.jsx";

import AdminLanding from "./pages/AdminLanding.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminWorkOrders from "./pages/AdminWorkOrders.jsx";
import AdminIssues from "./pages/AdminIssues.jsx";

import TechnicianLanding from "./pages/TechnicianLanding.jsx";
import TechnicianDashboard from "./pages/TechnicianDashboard.jsx";
import TechnicianWorkOrders from "./pages/TechnicianWorkOrders.jsx";

/* ---------- LAYOUT WITH ROLE BASED NAVBAR ---------- */
function Layout() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("cmms_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isLoggedIn = user !== null;
  const role = user?.role;

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const goProtected = (path) => {
    if (!localStorage.getItem("cmms_user")) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <div className="navbar-wrapper">
        <header className="container navbar d-flex flex-column flex-md-row justify-content-between align-items-center py-2">
          <div className="logo">Computer Maintenance Management System</div>

          <nav className="d-flex flex-wrap justify-content-center align-items-center gap-3">
            <Link to={role === "admin" ? "/admin" : role === "technician" ? "/technician" : "/"}>
            Home </Link>


            {/* 👤 USER / TECH NAV */}
            {role == "user" && (
              <>
                <button onClick={() => goProtected("/report")} className="nav-link-btn">
                  Report Issue
                </button>

                <button onClick={() => goProtected("/workorders")} className="nav-link-btn">
                  Work Orders
                </button>
              </>
            )}

            {/* 🛠 ADMIN NAV */}
            {role === "admin" && (
              <>
                <button onClick={() => goProtected("/admin-issues")} className="nav-link-btn">
                  Reported Issue
                </button>

                <button onClick={() => goProtected("/adminworkorders")} className="nav-link-btn">
                  Manage Orders
                </button>
              </>
            )}

            {role === "technician" && (
  <>
    <button onClick={() => goProtected("/workorders")} className="nav-link-btn">
      Assigned Tasks
    </button>
  </>
)}

            {isLoggedIn && <NotificationBell user={user} />}

            {!isLoggedIn ? (
              <Link to="/login" className="login-btn">
                Login / Sign Up
              </Link>
            ) : (
              <div className="login-dropdown">
                <button className="login-btn" type="button">
                  {user?.photo ? (
                    <img src={user.photo} alt="Profile" className="nav-avatar" />
                  ) : null}
                  My Account <span style={{ fontSize: 12 }}>▼</span>
                </button>

                <div className="dropdown-menu">

                  {/* ✅ FIXED DASHBOARD ROUTING */}
                  <button onClick={() => navigate(
  role === "admin"
    ? "/admindashboard"
    : role === "technician"
    ? "/techniciandashboard"
    : "/dashboard"
)}>
                    Dashboard
                  </button>

                  <button onClick={() => navigate("/workorders")}>
                    {role === "admin" ? "All Orders" : "My Orders"}
                  </button>

                  <button onClick={() => navigate("/profile")}>Profile</button>
                  <button onClick={logout}>Logout</button>
                </div>
              </div>
            )}
          </nav>
        </header>
      </div>
      <Outlet />
    </>
  );
}

const testimonialsData = [
  { name: "Rahul Sharma", role: "IT Admin", emoji: "👨‍💻", text: "This system reduced downtime significantly." },
  { name: "Anjali Verma", role: "Maintenance Staff", emoji: "👩‍🔧", text: "Managing work orders is now smooth." },
  { name: "Amit Das", role: "Technician", emoji: "🧑‍🔧", text: "Real-time notifications are very helpful." },
  { name: "Priya Singh", role: "System Manager", emoji: "👩‍💼", text: "Reports give clear insights." },
  { name: "Rohit Kumar", role: "Engineer", emoji: "👷", text: "Easy to use and efficient system." },
  { name: "Sneha Patil", role: "Supervisor", emoji: "🧑‍💼", text: "Improved maintenance workflow a lot." },
];

function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 3) % testimonialsData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const visible = [
    testimonialsData[index % testimonialsData.length],
    testimonialsData[(index + 1) % testimonialsData.length],
    testimonialsData[(index + 2) % testimonialsData.length],
  ];

  return (
    <div className="testimonials-section">

      <h2 className="testimonials-title">What Our Users Say</h2>
      <p className="testimonials-subtitle">
        See how our system is helping teams manage maintenance efficiently.
      </p>

      <div className="testimonials-container">
        {visible.map((item, i) => (
          <div className="testimonial-card" key={i}>
  
  {/* 👤 USER HEADER */}
  <div className="user-header">
    <div className="avatar">{item.emoji}</div>

    <div className="user-text">
      <span className="user-name">{item.name}</span>
      <span className="user-role">{item.role}</span>
    </div>
  </div>
  <div className="stars">⭐⭐⭐⭐⭐</div>

  <p className="review-text">{item.text}</p>

</div>
        ))}
      </div>

      {/* 🔘 DOTS */}
      <div className="dots">
        {Array.from({ length: testimonialsData.length / 3 }).map((_, i) => (
          <span
            key={i}
            className={index / 3 === i ? "dot active" : "dot"}
          ></span>
        ))}
      </div>

    </div>
  );
}

/* ---------- HOME PAGE ---------- */
function Home() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("cmms_user")); // ✅ ADDED

  const goProtected = (path) => {
    if (!localStorage.getItem("cmms_user")) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="app-main">
      <section className="hero-wrapper">
        <div className="container">
          <div className="row align-items-center text-center text-md-start">
            <div className="col-12 col-lg-5 mb-4">
              <div className="hero-left text-center text-lg-start">
                <h1>
                  Computer Maintenance
                  <br className="d-none d-lg-block" />
                  Management System
                </h1>

                <p>
                  Streamline IT maintenance and manage
                  <br />
                  work orders efficiently.
                </p>

                <div className="hero-buttons d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start">
                  <button className="btn-orange" onClick={() => goProtected("/report")}>
                    Report an Issue
                  </button>

                  <button className="btn-blue" onClick={() => goProtected("/workorders")}>
                    View Work Orders
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="hero-right text-center">
                <img src="/image.png" alt="Maintenance Illustration" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>

        <div className="wave">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
              d="M0 120L1440 120V48C1236 109 1009 119 720 48C430 -23 203 -13 0 48V120Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* STATS SECTION */}
      <div className="stats-section">
        <h2 className="stats-title">Our Impact</h2>
        <p className="stats-subtitle">
          Delivering efficient maintenance solutions across teams.
        </p>
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <h2>500+</h2>
            <p>Issues Resolved</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <h2>120+</h2>
            <p>Active Work Orders</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h2>25+</h2>
            <p>Technicians</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <h2>99%</h2>
            <p>System Efficiency</p>
          </div>
        </div>
      </div>

      <Testimonials />

      {/* ✅ FIXED CTA SECTION */}
      <div className="cta-section">
        <h2>Ready to streamline maintenance?</h2>
        <p>Start managing your system efficiently today.</p>

        <div className="cta-buttons">
          {!user ? (
            <>
              <button className="btn-orange" onClick={() => navigate("/signup")}>
                Get Started
              </button>

              <button className="btn-blue" onClick={() => navigate("/login")}>
                Login
              </button>
            </>
          ) : (
            <button
              className="btn-orange"
              onClick={() =>
                navigate("/dashboard"
                )
              }
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>

       <footer className="footer">
        <div className="footer-container">

          <div className="footer-section">
            <h3>CMMS System</h3>
            <p>
              Simplifying maintenance management with smart tracking,
              real-time updates, and efficient workflows.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/report">Report Issue</Link></li>
              <li><Link to="/workorders">Work Orders</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><Link to="/report">Equipment Tracking</Link></li>
              <li><Link to="/workorders">Work Orders</Link></li>
              <li><Link to="/dashboard">Reports</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: support@cmms.com</p>
            <p>Phone: +91 9876543210</p>
          </div>

        </div>

        <div className="footer-bottom">
          © 2026 CMMS System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


/* ---------- ROUTES ---------- */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<Home />} />
        <Route path="/admin-issues" element={<AdminIssues />} />

        <Route path="/admin" element={<ProtectedRoute><AdminLanding /></ProtectedRoute>} />
        <Route path="/admindashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route
  path="/adminworkorders"
  element={
    <ProtectedRoute>
      <AdminWorkOrders />
    </ProtectedRoute>
  }
/>


        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
        <Route path="/workorders" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
  path="/technician"
  element={
    <ProtectedRoute>
      <TechnicianLanding />
    </ProtectedRoute>
  }
/>

<Route
  path="/techniciandashboard"
  element={
    <ProtectedRoute>
      <TechnicianDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/tech-work"
  element={
    <ProtectedRoute>
      <TechnicianWorkOrders />
    </ProtectedRoute>
  }
/>
      </Route>
        
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="*" element={<div style={{ padding: 30 }}>Page not found</div>} />
    </Routes>
  );
}