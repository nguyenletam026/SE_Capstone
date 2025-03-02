import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../services/authenticationService";
import mainAvatar from "../../assets/2.png";
import defaultImage from "../../assets/3.png";

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img
          src={mainAvatar} // Thêm logo tại đây
          alt="Logo"
          className="w-10 h-10 rounded-full"
        />
        <span className="text-gray-800 font-bold text-lg">Student Stress Helper</span>
      </div>

      {/* Icons & Profile */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-600">
          🔔
        </button>
        <button className="text-gray-600">
          ☰
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={handleMenuToggle} className="flex items-center text-gray-600">
            <img
              src={defaultImage} // Thay bằng ảnh đại diện người dùng
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-3 w-40 bg-white rounded-lg shadow-lg py-2">
              <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                Settings
              </button>
              <button className="block px-4 py-2 w-full text-left hover:bg-gray-100">
                Help & Feedback
              </button>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 w-full text-left text-red-600 hover:bg-gray-100"
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
