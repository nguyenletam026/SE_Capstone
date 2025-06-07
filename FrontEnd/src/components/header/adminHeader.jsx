import { useState, useEffect, useRef } from "react";
import { 
  FaBell, 
  FaCog, 
  FaSignOutAlt, 
  FaUser, 
  FaSearch,
  FaMoon,
  FaSun,
  FaChevronDown 
} from "react-icons/fa";
import { 
  HiSparkles, 
  HiMenuAlt3, 
  HiX,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineBell
} from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { logOut } from "../../services/authenticationService";
import defaultImage from "../../assets/3.png";

export default function AdminHeader({ user }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  const notifications = [
    { id: 1, title: "New Question Added", message: "Assessment question has been created", time: "2 min ago", unread: true },
    { id: 2, title: "System Update", message: "New features are now available", time: "1 hour ago", unread: true },
    { id: 3, title: "User Registration", message: "5 new users registered today", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 px-6 py-4 flex justify-between items-center fixed w-full top-0 left-0 z-50">
      {/* Left Section - Logo & Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
            <HiSparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-xs text-gray-500">Welcome back, {user?.name || 'Admin'}</p>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <div className={`flex items-center transition-all duration-300 ${
            searchOpen 
              ? 'bg-white shadow-lg border border-gray-200' 
              : 'bg-gray-50 hover:bg-gray-100'
          } rounded-2xl`}>
            <FaSearch className="text-gray-400 ml-4 w-4 h-4" />
            <input
              type="text"
              placeholder="Search anything..."
              className={`bg-transparent border-none outline-none px-4 py-3 w-full text-gray-700 placeholder-gray-400 transition-all duration-300 ${
                searchOpen ? 'opacity-100' : 'opacity-70'
              }`}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-10">
                <div className="px-4 py-2 text-sm text-gray-500">Recent searches</div>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Questions management</div>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">User analytics</div>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">System settings</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          title="Toggle dark mode"
        >
          {darkMode ? (
            <FaSun className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          ) : (
            <FaMoon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            title="Notifications"
          >
            <HiOutlineBell className="w-5 h-5 group-hover:animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  <span className="text-sm text-blue-600 font-medium">{unreadCount} new</span>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                      notification.unread ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          to="/settings"
          className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          title="Settings"
        >
          <HiOutlineCog className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
          >
            <div className="relative">
              <img
                src={user?.avatar || defaultImage}
                alt="User Avatar"
                className="w-10 h-10 rounded-xl border-2 border-gray-200 group-hover:border-blue-300 transition-colors object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-800">
                {user?.name || 'nguyenletam026'}
              </div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
              {/* Profile Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.avatar || defaultImage}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-xl border-2 border-white shadow-md object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      {user?.name || 'nguyenletam026'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user?.email || 'admin@example.com'}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Administrator</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <HiOutlineUser className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">My Profile</div>
                    <div className="text-xs text-gray-500">Account settings & preferences</div>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <HiOutlineCog className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Settings</div>
                    <div className="text-xs text-gray-500">System configuration</div>
                  </div>
                </Link>

                <div className="my-2 border-t border-gray-100"></div>

                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group w-full"
                >
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                    <HiOutlineLogout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-red-400">Logout from your account</div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <div className="text-xs text-gray-400">
                  Last login: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}