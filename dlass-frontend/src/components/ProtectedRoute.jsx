import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../services/authService";

/**
 * ProtectedRoute – guards routes by authentication and optional role.
 *
 * Props:
 *   children  – the component to render when access is granted
 *   roles     – optional array of allowed roles, e.g. ["USER"] or ["PROVIDER"]
 *               if omitted, any authenticated user is allowed
 */
function ProtectedRoute({ children, roles }) {
  const token = getToken();
  const userRole = getUserRole(); // "USER" | "PROVIDER" | "ADMIN"

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → redirect to appropriate dashboard
  if (roles && !roles.includes(userRole)) {
    if (userRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (userRole === "PROVIDER") {
      return <Navigate to="/provider-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
