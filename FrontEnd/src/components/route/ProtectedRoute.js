import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a proper loading screen instead of null
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    // More informative message for debugging
    console.info("🔒 Authentication required, redirecting to login page...");
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
