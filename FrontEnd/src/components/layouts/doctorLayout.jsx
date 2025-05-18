import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaComments } from "react-icons/fa";
import { logOut } from "../../services/authenticationService";
import DoctorNotification from "../notification/DoctorNotification";
import { ChatProvider } from "../../context/ChatContext";

export default function DoctorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  return (
    <ChatProvider>
      <div className="min-h-screen flex bg-gray-100">
        {/* Sidebar */}
        <aside
          className={`bg-white shadow-md transition-all duration-300 flex flex-col justify-between ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div>
            <div className="flex items-center justify-between p-4 border-b">
              <h2
                className={`text-xl font-bold text-blue-700 ${
                  collapsed ? "hidden" : "block"
                }`}
              >
                Bác Sĩ
              </h2>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-600 hover:text-blue-600"
              >
                <FaBars />
              </button>
            </div>
            <nav className="p-4 space-y-4">
              <Link
                to="/doctor-home"
                className={`block px-4 py-2 rounded ${
                  isActive("/doctor-home")
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "text-sm text-center" : ""}`}
              >
                Trang chính
              </Link>
              <Link
                to="/doctor-pending-requests"
                className={`block px-4 py-2 rounded ${
                  isActive("/doctor-pending-requests")
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "text-sm text-center" : ""}`}
              >
                Yêu cầu đang chờ
              </Link>
              <Link
                to="/doctor-chat"
                className={`block px-4 py-2 rounded flex items-center gap-2 ${
                  isActive("/doctor-chat")
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "justify-center text-sm" : ""}`}
              >
                <FaComments /> {!collapsed && "Trò chuyện"}
              </Link>
            </nav>
          </div>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-semibold w-full px-4 py-2 hover:bg-red-50 rounded"
            >
              <FaSignOutAlt />
              {!collapsed && "Đăng xuất"}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-lg font-bold">Bác Sĩ Dashboard</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm">Xin chào! Hãy chăm sóc bệnh nhân một cách tận tâm 💙</p>
                <DoctorNotification />
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-0 bg-gray-50">{children}</div>


          {/* Footer */}
          <footer className="bg-gray-100 text-center text-sm py-4 text-gray-600 mt-auto">
            © 2025 Student Stress Helper - Hệ thống hỗ trợ sức khỏe tinh thần
          </footer>
        </main>
      </div>
    </ChatProvider>
  );
}
