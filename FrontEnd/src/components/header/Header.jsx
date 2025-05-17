import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import defaultImage from "../../assets/3.png";
import Bot from "../../assets/4.png";
import {
  ShoppingCartOutlined,
  BellOutlined,
  MenuOutlined,
} from "@ant-design/icons";

export default function Header({ cartItemsCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const { logout } = useAuth();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleLogout = () => {
    logout();
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

  // Auto close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
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

        {/* Navigation Links - Desktop only */}
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex space-x-6 text-sm font-semibold text-gray-700">
            <li><Link to="/about" className="hover:text-green-600">About Us</Link></li>
            <li><Link to="/daily" className="hover:text-green-600">Daily Assessment</Link></li>
            <li><Link to="/products" className="hover:text-green-600">Health Products</Link></li>
            <li><Link to="/chatroom" className="hover:text-green-600">Doctor Advice</Link></li>
            <li><Link to="/deposit" className="hover:text-green-600">Deposit</Link></li>
          </ul>
        </nav>

        {/* Profile Actions */}
        <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
          {/* Become Doctor */}
          <Link
            to="/apply-doctor"
            className="hidden md:inline bg-[#00C3FF] hover:bg-[#00aadd] text-white font-semibold px-4 py-2 rounded-full text-sm transition"
          >
            Trở thành bác sĩ tâm lý
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative">
            <ShoppingCartOutlined style={{ fontSize: "24px" }} className="text-gray-600 hover:text-blue-600 transition-colors" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartItemsCount > 99 ? "99+" : cartItemsCount}
              </span>
            )}
          </Link>

          <button className="text-gray-600 hover:text-gray-800 transition">
            <BellOutlined style={{ fontSize: "22px" }} />
          </button>

          <button
            className="md:hidden text-gray-600 hover:text-gray-800 transition"
            onClick={handleMenuToggle}
          >
            <MenuOutlined style={{ fontSize: "22px" }} />
          </button>

          <div className="relative hidden md:block">
            <button onClick={handleMenuToggle} className="flex items-center focus:outline-none">
              <img
                src={defaultImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
              />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50">
                <Link to="/user-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Order History</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                <Link to="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help & Feedback</Link>
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

      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white shadow-md z-40 px-6 py-4">
          <ul className="space-y-4 text-sm font-semibold text-gray-700">
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link></li>
            <li><Link to="/daily" onClick={() => setMenuOpen(false)}>Daily Assessment</Link></li>
            <li><Link to="/products" onClick={() => setMenuOpen(false)}>Health Products</Link></li>
            <li><Link to="/chatroom" onClick={() => setMenuOpen(false)}>Doctor Advice</Link></li>
            <li><Link to="/deposit" onClick={() => setMenuOpen(false)}>Deposit</Link></li>
            <li><Link to="/apply-doctor" onClick={() => setMenuOpen(false)}>Trở thành bác sĩ tâm lý</Link></li>
            <li><Link to="/user-profile" onClick={() => setMenuOpen(false)}>My Profile</Link></li>
            <li><Link to="/orders" onClick={() => setMenuOpen(false)}>Order History</Link></li>
            <li><Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link></li>
            <li><Link to="/help" onClick={() => setMenuOpen(false)}>Help & Feedback</Link></li>
            <li>
              <button onClick={handleLogout} className="text-red-600 w-full text-left">Sign Out</button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
