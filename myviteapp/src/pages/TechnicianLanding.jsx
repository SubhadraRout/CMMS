import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TechnicianLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("cmms_user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "technician") {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="app-main">
      <section className="hero-wrapper">
        <div className="container">
          <div className="row align-items-center text-center text-md-start">

            <div className="col-12 col-lg-5 mb-4">
              <div className="hero-left text-center text-lg-start">
                <h1>Technician Panel</h1>

                <p>
                  View assigned tasks,see works completed
                  <br />
                  and handle maintenance operations efficiently.
                </p>

                <div className="hero-buttons d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start">

                  {/* ✅ EXISTING */}
                  <button
                    className="btn-blue"
                    onClick={() => navigate("/tech-work")}
                  >
                    View Assigned Work
                  </button>

                  {/* 🔥 NEW BUTTON */}
                  <button
                    className="btn-blue"
                    onClick={() => navigate("/tech-completed")}
                  >
                    My Works (Completed)
                  </button>

                  

                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="hero-right text-center">
                <img
                  src="/image.png"
                  alt="Technician Illustration"
                  className="img-fluid"
                />
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

      <footer className="footer">
        <div className="footer-container">

          <div className="footer-section">
            <h3>CMMS System</h3>
            <p>
              Helping technicians manage tasks, track issues,
              and update work progress efficiently.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => navigate("/")}>Home</li>
              <li onClick={() => navigate("/workorders")}>My Work</li>
              <li onClick={() => navigate("/notification")}>Notifications</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Assigned Tasks</li>
              <li>Status Updates</li>
              <li>Notifications</li>
              <li>Reports</li>
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