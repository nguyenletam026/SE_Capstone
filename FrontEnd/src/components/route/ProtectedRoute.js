import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    console.warn("User not logged in, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role có hợp lệ không
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  if (!allowedRoles.some((role) => userRoles.includes(role))) {
    console.warn(`User role ${userRoles} not authorized, redirecting to /`);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
