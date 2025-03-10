import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/route/ProtectedRoute";
// import RequireAuth from "../components/route/RequireAuth";

// Auth Pages
import LandingPage from "../page/authPage/landingPage";
import Login from "../page/authPage/Login";
import Authenticate from "../page/authPage/Authenticate";

// User Pages
import Home from "../page/userPage/Home";

// Admin Pages
import AdminHome from "../page/adminPage/adminHome";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Route Đăng nhập */}
          <Route path="/login" element={<Login />} />
          <Route path="/authenticate" element={<Authenticate />} />
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          {/* Redirect nếu truy cập "/" mà chưa đăng nhập */}
          {/* <Route path="/" element={<Navigate to="/home" replace />} /> */}

          {/* Route User */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_USER"]} />}>
            <Route path="/home" element={<Home />} />
          </Route>

          {/* Route Admin */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="/admin-dashboard" element={<AdminHome />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;
