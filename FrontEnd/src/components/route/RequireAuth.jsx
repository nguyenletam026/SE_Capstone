import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    console.warn("User not logged in, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  return children;
}
