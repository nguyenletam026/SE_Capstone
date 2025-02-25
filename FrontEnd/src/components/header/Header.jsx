import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../services/authenticationService";

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="" // Thêm logo của bạn tại đây
            alt="Logo"
            className="w-10 h-10 rounded-lg"
          />
          <span className="text-white font-bold text-xl">App Name</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-white px-3 py-1 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Search..."
            className="border-none outline-none text-gray-700"
          />
          <button className="text-gray-600">
            🔍
          </button>
        </div>

        {/* Icons & Profile */}
        <div className="flex items-center space-x-4">
          <button className="text-white relative">
            📩
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
              4
            </span>
          </button>
          <button className="text-white relative">
            🔔
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
              17
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button onClick={handleMenuToggle} className="text-white text-lg">
              👤
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg">
                <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                  Profile
                </button>
                <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 w-full text-left text-red-600 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={handleMobileMenuToggle}>
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700 text-white flex flex-col items-center py-3 space-y-3">
          <button className="hover:bg-blue-500 px-4 py-2 rounded-lg w-full">📩 Messages (4)</button>
          <button className="hover:bg-blue-500 px-4 py-2 rounded-lg w-full">🔔 Notifications (17)</button>
          <button className="hover:bg-blue-500 px-4 py-2 rounded-lg w-full">👤 Profile</button>
          <button className="hover:bg-blue-500 px-4 py-2 rounded-lg w-full">⚙️ Settings</button>
          <button onClick={handleLogout} className="text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg w-full">
            🚪 Log Out
          </button>
        </div>
      )}
    </header>
  );
}
