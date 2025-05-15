import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { logOut } from "../../services/authenticationService";
import defaultImage from "../../assets/3.png";
import Bot from "../../assets/4.png";
import { ShoppingCartOutlined, BellOutlined, MenuOutlined } from "@ant-design/icons";

export default function Header({ cartItemsCount = 0 }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

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
      <Link to="/home" className="flex items-center gap-2 flex-shrink-0">
        <img
          src={Bot}
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-gray-800 font-bold text-lg">
          Student Stress Helper
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="flex justify-center space-x-6 text-sm font-semibold text-gray-700">
          <li>
            <Link to="/about" className="hover:text-green-600">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/daily" className="hover:text-green-600">
              Daily Assessment
            </Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-green-600">
              Health Products
            </Link>
          </li>
          <li>
            <Link to="/chatroom" className="hover:text-green-600">
              Doctor  Advice
            </Link>
          </li>
          <li>
            <Link to="/deposit" className="hover:text-green-600">
              Deposit
            </Link>
          </li>
          
        </ul>
      </nav>

      {/* Profile Actions */}
      <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
        {/* Become Doctor Button */}
        <Link
          to="/apply-doctor"
          className="bg-[#00C3FF] hover:bg-[#00aadd] text-white font-semibold px-4 py-2 rounded-full text-sm transition"
        >
          Trở thành bác sĩ tâm lý
        </Link>

        {/* Cart Icon */}
        <Link to="/cart" className="relative">
          <ShoppingCartOutlined style={{ fontSize: '24px' }} className="text-gray-600 hover:text-blue-600 transition-colors" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItemsCount > 99 ? '99+' : cartItemsCount}
            </span>
          )}
        </Link>

        {/* Notification Icon */}
        <button className="text-gray-600 hover:text-gray-800 transition">
          <BellOutlined style={{ fontSize: '22px' }} />
        </button>

        {/* Hamburger Icon */}
        <button className="text-gray-600 hover:text-gray-800 transition">
          <MenuOutlined style={{ fontSize: '22px' }} />
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
              <Link
                to="/user-profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Order History
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
              </Link>
              <Link
                to="/help"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Help & Feedback
              </Link>
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
