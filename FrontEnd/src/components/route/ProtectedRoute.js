import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Tránh render quá sớm → lỗi loop
    return null; // hoặc <LoadingScreen />
  }

  if (!user) {
    console.warn("❌ User not logged in, redirecting to /login...");
    return <Navigate to="/login" replace />;
  }

  const userRoles = Array.isArray(user.role) ? user.role : [user.role];

  console.log("✅ userRoles:", userRoles);
  console.log("✅ allowedRoles:", allowedRoles);

  if (!allowedRoles.some((role) => userRoles.includes(role))) {
    console.warn(`⛔ User role ${userRoles} not authorized, redirecting to /`);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
