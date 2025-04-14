import { useState } from "react";
import { FaBell, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { logOut } from "../../services/authenticationService";
import defaultImage from "../../assets/3.png";

export default function AdminHeader({ user }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleLogout = () => {
    logOut();
    navigate("/login");
  };
  return (
    <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center fixed w-full top-0 left-0 z-50">
      <div className="text-lg font-bold">Analytics Dashboard</div>

      {/* Icons & Profile */}
      <div className="flex items-center space-x-4">
        <FaBell className="text-gray-600 cursor-pointer" size={20} />
        <FaCog className="text-gray-600 cursor-pointer" size={20} />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2"
          >
            <img
              src={defaultImage}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border border-gray-300"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <FaUser className="inline-block mr-2" /> Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <FaCog className="inline-block mr-2" /> Settings
              </Link>
              <button
                onClick={handleLogout} // Đưa onClick vào button thay vì icon
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <FaSignOutAlt className="inline-block mr-2" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
