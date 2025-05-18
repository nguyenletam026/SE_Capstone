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
import VerifyEmail from "../page/authPage/VerifyEmail";


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
import ProductList from "../page/userPage/ProductList";
import ProductDetail from "../page/userPage/ProductDetail";
import OrderHistory from "../page/userPage/OrderHistory";
import CartPage from "../page/userPage/CartPage";

// Admin Pages
import AdminLayout from "../components/layouts/adminLayout";
import AdminHome from "../page/adminPage/adminHome";
import AdminManageRole from "../page/adminPage/adminManageRole";
import AdminManageUser from "../page/adminPage/adminManageUser";
import AdminManageDoctor from "../page/adminPage/adminManageDoctor";
import AdminManageTeacher from "../page/adminPage/AdminManageTeacher";
import AdminManageProducts from "../page/adminPage/AdminManageProducts";
import AdminMusicManage from "../page/adminPage/AdminMusicManage";
import AdminVideoManage from "../page/adminPage/AdminVideoManage";
import AdminDepositHistory from "../page/adminPage/AdminDepositHistory";
import AdminDoctorSchedule from "../page/adminPage/AdminDoctorSchedule";

// Doctor Pages
import DoctorLayout from "../components/layouts/doctorLayout";
import DoctorHome from "../page/doctorPage/doctorHome";
import DoctorChatPage from "../page/doctorPage/doctorChatPage";
import PendingRequests from "../page/doctorPage/doctorPendingRequest";

// Teacher Pages
import TeacherLayout from "../components/layouts/TeacherLayout";
import TeacherHome from "../page/teacherPage/TeacherHome";
import TeacherClasses from "../page/teacherPage/TeacherClasses";
import ClassDetail from "../page/teacherPage/ClassDetail";
import StudentDetail from "../page/teacherPage/StudentDetail";
import TeacherStressAnalysis from "../page/teacherPage/TeacherStressAnalysis";

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
          <Route path="/verify-email" element={<VerifyEmail />} />
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
            <Route path="/products" element={<UserLayout><ProductList /></UserLayout>} />
            <Route path="/products/:id" element={<UserLayout><ProductDetail /></UserLayout>} />
            <Route path="/orders" element={<UserLayout><OrderHistory /></UserLayout>} />
            <Route path="/cart" element={<UserLayout><CartPage /></UserLayout>} />
          </Route>

          {/* Route Admin */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="/admin-dashboard" element={<AdminHome />} />
            <Route path="/admin-role" element={<AdminLayout><AdminManageRole /></AdminLayout>} />
            <Route path="/admin-user" element={<AdminLayout><AdminManageUser /></AdminLayout>} />
            <Route path="/admin-doctor" element={<AdminLayout><AdminManageDoctor /></AdminLayout>} />
            <Route path="/admin-doctor-schedule" element={<AdminLayout><AdminDoctorSchedule /></AdminLayout>} />
            <Route path="/admin-teacher" element={<AdminLayout><AdminManageTeacher /></AdminLayout>} />
            <Route path="/admin-products" element={<AdminLayout><AdminManageProducts /></AdminLayout>} />
            <Route path="/admin-music" element={<AdminLayout><AdminMusicManage /></AdminLayout>} />
            <Route path="/admin-video" element={<AdminLayout><AdminVideoManage /></AdminLayout>} />
            <Route path="/admin-deposits" element={<AdminDepositHistory />} />
          </Route>

          {/* Route Doctor */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_DOCTOR"]} />}>
            <Route path="/doctor-home" element={<DoctorLayout><DoctorHome /></DoctorLayout>} />
            <Route path="/doctor-chat" element={<DoctorLayout><DoctorChatPage /></DoctorLayout>} />
            <Route path="/doctor-pending-requests" element={<DoctorLayout><PendingRequests /></DoctorLayout>} />
          </Route>

          {/* Route Teacher */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_TEACHER"]} />}>
            <Route path="/teacher-home" element={<TeacherLayout><TeacherHome /></TeacherLayout>} />
            <Route path="/teacher-classes" element={<TeacherLayout><TeacherClasses /></TeacherLayout>} />
            <Route path="/teacher-classes/:classId" element={<TeacherLayout><ClassDetail /></TeacherLayout>} />
            <Route path="/teacher-student/:studentId" element={<TeacherLayout><StudentDetail /></TeacherLayout>} />
            <Route path="/teacher-stress-analysis" element={<TeacherLayout><TeacherStressAnalysis /></TeacherLayout>} />
          </Route>
            
          {/* Dang phat trien */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;