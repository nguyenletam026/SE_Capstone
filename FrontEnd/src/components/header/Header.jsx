import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logOut } from "../../services/authenticationService";
import mainAvatar from "../../assets/2.png";
import defaultImage from "../../assets/3.png";

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  // 👉 Auto close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full h-16 z-50 bg-white shadow-md px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <img
          src={mainAvatar}
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-gray-800 font-bold text-lg">Student Stress Helper</span>
      </div>

      {/* Navigation Links - Centered */}
      <nav className="flex-1">
        <ul className="flex justify-center space-x-6 text-sm font-semibold text-gray-700">
          <li><Link to="/about" className="hover:text-green-600">Về Chúng Tôi</Link></li>
          <li><Link to="/store" className="hover:text-green-600">Store</Link></li>
          <li><Link to="/transactions" className="hover:text-green-600">Xem Giao Dịch</Link></li>
          <li><Link to="/chatroom" className="hover:text-green-600">ChatRoom</Link></li>
          <li><Link to="/plans" className="hover:text-green-600">Gói</Link></li>
        </ul>
      </nav>

      {/* Icons & Profile */}
      <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
        <button className="text-gray-600 text-xl hover:text-gray-800 transition">
          🔔
        </button>
        <button className="text-gray-600 text-xl hover:text-gray-800 transition">
          ☰
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="flex items-center focus:outline-none"
          >
            <img
              src={defaultImage}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover cursor-pointer"
            />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Help & Feedback
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
