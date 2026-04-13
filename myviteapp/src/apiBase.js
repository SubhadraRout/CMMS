/**
 * Same-origin `/api` works with the Vite dev proxy (see vite.config.js).
 * Set VITE_API_URL if the UI is served from a different host than the API
 * (for example http://192.168.1.10:5000 when testing from another device).
 */
export function apiUrl(path) {
  const base = (import.meta.env?.VITE_API_URL ?? "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (base) return `${base}${p}`;
  return p;
}

export function resolveStoredUserId(user) {
  if (!user || typeof user !== "object") return "";
  const raw = user._id ?? user.id;
  if (raw == null) return "";
  return String(raw);
}
