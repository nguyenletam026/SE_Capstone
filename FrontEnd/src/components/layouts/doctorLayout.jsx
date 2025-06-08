import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaBars, 
  FaSignOutAlt, 
  FaComments, 
  FaHome, 
  FaUserMd, 
  FaCalendarCheck, 
  FaChartLine, 
  FaClock,
  FaBell,
  FaMoneyBillWave,
  FaWallet
} from "react-icons/fa";
import { 
  MdDashboard, 
  MdOutlineHealthAndSafety, 
  MdNightlight
} from "react-icons/md";
import { logOut } from "../../services/authenticationService";
import DoctorNotification from "../notification/DoctorNotification";
import { ChatProvider } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

export default function DoctorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <ChatProvider>
      <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* Sidebar */}
        <aside
          className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg transition-all duration-300 flex flex-col justify-between ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div>
            <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'border-gray-700' : 'border-b'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-100'}`}>
                  <FaUserMd className={`text-xl ${isDarkMode ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-700'} ${
                    collapsed ? "hidden" : "block"
                  }`}
                >
                  Doctor Portal
                </h2>
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}
              >
                <FaBars />
              </button>
            </div>
            
            <div className={`mt-6 mb-6 px-4 ${collapsed ? "hidden" : "block"}`}>
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {user?.username?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-blue-800'}`}>
                      {user?.username || "Doctor"}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>Psychologist</p>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
              <Link
                to="/doctor-home"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive("/doctor-home")
                    ? isDarkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 font-semibold"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700" 
                      : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "justify-center" : ""}`}
              >                <MdDashboard className="text-xl" />
                {!collapsed && <span>Dashboard</span>}
              </Link>
              
              <Link
                to="/doctor-chat"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive("/doctor-chat")
                    ? isDarkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 font-semibold"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700" 
                      : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "justify-center" : ""}`}
              >                <FaComments className="text-xl" />
                {!collapsed && <span>Patient Consultation</span>}
              </Link>
                <Link
                to="/doctor-schedule"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive("/doctor-schedule")
                    ? isDarkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 font-semibold"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700" 
                      : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "justify-center" : ""}`}
              >                <FaCalendarCheck className="text-xl" />
                {!collapsed && <span>Work Schedule</span>}
              </Link>
              
              <Link
                to="/doctor-earnings"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive("/doctor-earnings")
                    ? isDarkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 font-semibold"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700" 
                      : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "justify-center" : ""}`}
              >                <FaMoneyBillWave className="text-xl" />
                {!collapsed && <span>Earnings</span>}
              </Link>
              
              <Link
                to="/doctor-withdrawals"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive("/doctor-withdrawals")
                    ? isDarkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 font-semibold"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700" 
                      : "text-gray-700 hover:bg-blue-50"
                } ${collapsed ? "justify-center" : ""}`}
              >                <FaWallet className="text-xl" />
                {!collapsed && <span>Withdrawals</span>}
              </Link>
              
              
            </nav>
          </div>

          {/* Bottom section */}
          <div className={`p-4 ${isDarkMode ? 'border-t border-gray-700' : 'border-t'}`}>
            {!collapsed && (
              <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-800'}`}>
                <div className="flex items-center gap-2">
                  <FaClock />
                  <span className="text-sm">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-3 transition-all ${
                isDarkMode 
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <MdNightlight className="text-xl" />
              {!collapsed && <span>{isDarkMode ? "Chế độ sáng" : "Chế độ tối"}</span>}
            </button>
            
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isDarkMode 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <FaSignOutAlt className="text-xl" />
              {!collapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50'}`}>
          {/* Header */}
          <header className={`${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-600 to-blue-800'} text-white py-3 px-6 shadow-lg`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <MdOutlineHealthAndSafety className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Student Stress Helper</h1>
                  <p className="text-xs text-blue-100">{greeting()}, Bác sĩ!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`hidden md:flex items-center gap-2 py-2 px-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white bg-opacity-20'}`}>
                  <FaCalendarCheck className="text-blue-100" />
                  <span className="text-sm">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
                </div>
                
                <div className="relative">
                  <DoctorNotification />
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-6">{children}</div>

          {/* Footer */}
          <footer className={`${isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'} text-center text-sm py-4 shadow-inner mt-auto`}>
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">              <p>© 2025 Student Stress Helper - Mental Health Support System</p>
              <div className="flex gap-4 mt-2 md:mt-0">
                <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Support</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </ChatProvider>
  );
}
