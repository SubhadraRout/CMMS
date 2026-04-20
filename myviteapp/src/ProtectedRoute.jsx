import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(sessionStorage.getItem("cmms_user"));

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
