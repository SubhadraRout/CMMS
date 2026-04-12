import React from "react";
import { Routes, Route, Link, useNavigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

import "./App.css";

import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";

import ReportIssue from "./pages/ReportIssue.jsx";
import WorkOrders from "./pages/WorkOrders.jsx";
import Notification from "./pages/Notification.jsx";
import ForgotPassword from "./pages/ForgotPassword";

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
import AdminIssues from "./pages/AdminIssues";

import TechnicianLanding from "./pages/TechnicianLanding.jsx";
import TechnicianDashboard from "./pages/TechnicianDashboard.jsx";
import TechnicianWorkOrders from "./pages/TechnicianWorkOrders.jsx";

/* ✅ TOAST */
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- LAYOUT ---------- */
function Layout() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("cmms_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isLoggedIn = user !== null;
  const role = user?.role;

  const [lastNotif, setLastNotif] = useState("");

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

  /* ✅ NOTIFICATION POPUP */
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/notifications/${user.role}`
        );
        const data = await res.json();

        if (data.length > 0) {
          const latest = data[0];

          if (latest._id !== lastNotif) {
            toast.info(latest.message);
            setLastNotif(latest._id);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, lastNotif]);

  return (
    <>
      <div className="navbar-wrapper">
        <header className="container navbar d-flex flex-column flex-md-row justify-content-between align-items-center py-2">
          <div className="logo">Computer Maintenance Management System</div>

          <nav className="d-flex flex-wrap justify-content-center align-items-center gap-3">
            <Link to={role === "admin" ? "/admin" : role === "technician" ? "/technician" : "/"}>
              Home
            </Link>

            {role === "user" && (
              <>
                <button onClick={() => goProtected("/report")} className="nav-link-btn">
                  Report Issue
                </button>
                <button onClick={() => goProtected("/workorders")} className="nav-link-btn">
                  Work Orders
                </button>
              </>
            )}

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
              <button onClick={() => goProtected("/workorders")} className="nav-link-btn">
                Assigned Tasks
              </button>
            )}

            {isLoggedIn && <Link to="/notification">🔔</Link>}

            {!isLoggedIn ? (
              <Link to="/login" className="login-btn">
                Login / Sign Up
              </Link>
            ) : (
              <div className="login-dropdown">
                <button className="login-btn" type="button">
                  My Account ▼
                </button>

                <div className="dropdown-menu">
                  <button
                    onClick={() =>
                      navigate(
                        role === "admin"
                          ? "/admindashboard"
                          : role === "technician"
                          ? "/techniciandashboard"
                          : "/dashboard"
                      )
                    }
                  >
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

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

/* ---------- HOME (RESTORED UI) ---------- */
function Home() {
  const navigate = useNavigate();

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
              <div className="hero-left">
                <h1>
                  Computer Maintenance
                  <br />
                  Management System
                </h1>

                <p>
                  Streamline IT maintenance and manage
                  <br />
                  work orders efficiently.
                </p>

                <div className="hero-buttons d-flex gap-3">
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
                <img src="/image.png" alt="Maintenance" className="img-fluid" />
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- ROUTES ---------- */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        <Route path="/" element={<Home />} />

        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute><AdminLanding /></ProtectedRoute>} />
        <Route path="/admindashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* ✅ FIXED (only once) */}
        <Route
          path="/adminworkorders"
          element={
            <ProtectedRoute>
              <AdminWorkOrders />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-issues" element={<AdminIssues />} />

        {/* USER */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
        <Route path="/workorders" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />

        {/* TECH */}
        <Route path="/technician" element={<ProtectedRoute><TechnicianLanding /></ProtectedRoute>} />
        <Route path="/techniciandashboard" element={<ProtectedRoute><TechnicianDashboard /></ProtectedRoute>} />
        <Route path="/tech-work" element={<ProtectedRoute><TechnicianWorkOrders /></ProtectedRoute>} />

        {/* COMMON */}
        <Route path="/notification" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* STATIC */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<Privacy />} />

      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="*" element={<div style={{ padding: 30 }}>Page not found</div>} />
    </Routes>
  );
}