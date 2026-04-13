import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl, resolveStoredUserId } from "../apiBase.js";

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loadError, setLoadError] = useState("");
  const wrapRef = useRef(null);

  const userId = resolveStoredUserId(user);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoadError("Missing account id — please log out and log in again.");
      return;
    }
    setLoadError("");
    try {
      const res = await fetch(apiUrl(`/api/notifications/for-user/${encodeURIComponent(userId)}`));
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        setItems([]);
        setLoadError("Invalid response from server.");
        return;
      }
      if (!res.ok) {
        setItems([]);
        setLoadError(data?.error || data?.message || `Could not load notifications (${res.status}).`);
        return;
      }
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setLoadError("Network error — is the API running? Try starting the backend on port 5000.");
    }
  }, [userId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 45000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const unread = items.filter((n) => !n.read);
  const unreadCount = unread.length;

  const markOneRead = async (id) => {
    try {
      await fetch(apiUrl(`/api/notifications/${id}/read`), { method: "PATCH" });
    } finally {
      load();
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await fetch(apiUrl("/api/notifications/mark-all-read"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } finally {
      load();
    }
  };

  return (
    <div className="notification-wrapper" ref={wrapRef}>
      <button
        type="button"
        className="nav-notification-bell"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <span className="nav-notification-bell-icon" aria-hidden="true">
          🔔
        </span>
        {unreadCount > 0 ? (
          <span className="nav-notification-dot" title={`${unreadCount} unread`} />
        ) : null}
      </button>

      {open && (
        <div className="notif-panel notif-panel--dropdown">
          <h4>Notifications</h4>
          {loadError ? (
            <p className="notif-error">{loadError}</p>
          ) : items.length === 0 ? (
            <p className="notif-empty">No notifications yet</p>
          ) : (
            <>
              {unreadCount > 0 && (
                <button type="button" className="notif-clear-all" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              <ul className="notif-list">
                {items.map((n) => (
                  <li
                    key={n._id}
                    className={`notif-item${n.read ? " notif-item--read" : ""}`}
                  >
                    <span className="notif-item-text">{n.message}</span>
                    {!n.read && (
                      <button
                        type="button"
                        className="notif-item-dismiss"
                        onClick={() => markOneRead(n._id)}
                        aria-label="Dismiss"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
