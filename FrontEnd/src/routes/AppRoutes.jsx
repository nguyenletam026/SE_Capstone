import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/route/ProtectedRoute";
// import RequireAuth from "../components/route/RequireAuth";

// Auth Pages
import LandingPage from "../page/authPage/landingPage";
import Login from "../page/authPage/Login";
import Authenticate from "../page/authPage/Authenticate";
import ForgotPassword from "../page/authPage/forgotPasswordPage";
import SignUp from "../page/authPage/SignUp";


// User Pages
import UserLayout from "../components/layouts/userLayout";
import Home from "../page/userPage/Home";
import StartAssessment from "../page/userPage/userStartAssessment";
import UserHealthAssessment from "../page/userPage/userHealthAssessment";
import AssessmentResult from "../page/userPage/userAssessmentResult";
import ChatWithDoctor from "../page/userPage/userChatWithDoctor";
import Recommendation from "../page/userPage/userRecommendation";
import UserContactDoctor from "../page/userPage/userContactDoctor";
import UserChatDoctor from "../page/userPage/userChatDoctor";
import ApplyDoctor from "../page/userPage/userApplyDoctor";
import UserProfile from "../page/userPage/userProfile";
import AboutUs from "../page/userPage/AboutUs";
import SubscriptionPage from "../page/userPage/Subscription";
import Settings from "../page/userPage/Setting";
import HelpAndFeedback from "../page/userPage/Feedback";
import DepositPage from "../pages/DepositPage";

// Admin Pages
import AdminLayout from "../components/layouts/adminLayout";
import AdminHome from "../page/adminPage/adminHome";
import AdminManageRole from "../page/adminPage/adminManageRole";
import AdminManageUser from "../page/adminPage/adminManageUser";
import AdminManageDoctor from "../page/adminPage/adminManageDoctor";

// Doctor Pages
import DoctorLayout from "../components/layouts/doctorLayout";
import DoctorHome from "../page/doctorPage/doctorHome";
import DoctorChatPage from "../page/doctorPage/doctorChatPage";
import PendingRequests from "../page/doctorPage/doctorPendingRequest";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Route Đăng nhập */}
          <Route path="/login" element={<Login />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          {/* Redirect nếu truy cập "/" mà chưa đăng nhập */}
          {/* <Route path="/" element={<Navigate to="/home" replace />} /> */}

          {/* Route User */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_USER"]} />}>
            <Route path="/home" element={<UserLayout><Home /></UserLayout>} />
            <Route path="/daily" element={<UserLayout><StartAssessment /></UserLayout>} />
            <Route path="/assessment/step" element={<UserLayout><UserHealthAssessment /></UserLayout>} />
            <Route path="/assessment/result" element={<UserLayout><AssessmentResult /></UserLayout>} />
            <Route path="/assessment/recommend" element={<UserLayout><Recommendation /></UserLayout>} />
            <Route path="/assessment/recommend" element={<UserLayout><Recommendation /></UserLayout>} />
            <Route path="/contact-doctor/:id" element={<UserLayout><UserContactDoctor /></UserLayout>} />
            <Route path="/chatroom" element={<UserLayout><UserChatDoctor /></UserLayout>} />
            <Route path="/apply-doctor" element={<UserLayout><ApplyDoctor /></UserLayout>} />
            <Route path="/user-profile" element={<UserLayout><UserProfile /></UserLayout>} />
            <Route path="/about" element={<UserLayout><AboutUs /></UserLayout>} />
            <Route path="/plans" element={<UserLayout><SubscriptionPage /></UserLayout>} />
            <Route path="/settings" element={<UserLayout><Settings /></UserLayout>} />
            <Route path="/help" element={<UserLayout><HelpAndFeedback /></UserLayout>} />
            <Route path="/deposit" element={<UserLayout><DepositPage /></UserLayout>} />
          </Route>

          {/* Route Admin */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="/admin-dashboard" element={<AdminHome />} />
            <Route path="/admin-role" element={<AdminLayout><AdminManageRole /></AdminLayout>} />
            <Route path="/admin-user" element={<AdminLayout><AdminManageUser /></AdminLayout>} />
            <Route path="/admin-doctor" element={<AdminLayout><AdminManageDoctor /></AdminLayout>} />
          </Route>

          {/* Route Doctor */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]} />}>
            <Route path="/doctor-home" element={<DoctorLayout><DoctorHome /></DoctorLayout>} />
            <Route path="/doctor-chat" element={<DoctorLayout><DoctorChatPage /></DoctorLayout>} />
            <Route path="/doctor-pending-requests" element={<DoctorLayout><PendingRequests /></DoctorLayout>} />
            
          </Route>
            
          {/* Dang phat trien */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;