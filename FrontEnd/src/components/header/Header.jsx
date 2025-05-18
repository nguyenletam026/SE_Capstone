import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import defaultImage from "../../assets/3.png";
import Bot from "../../assets/4.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  FaShoppingCart, 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaQuestionCircle, 
  FaHistory, 
  FaWallet, 
  FaHeartbeat, 
  FaClipboardCheck, 
  FaUserMd, 
  FaInfoCircle, 
  FaBars, 
  FaSearch,
  FaMoon,
  FaSun
} from "react-icons/fa";

export default function Header({ cartItemsCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef();
  const searchRef = useRef();
  const { logout } = useAuth();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleSearchToggle = () => setSearchOpen(!searchOpen);
  
  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Thực hiện logic chuyển đổi dark mode ở đây
    toast.info(darkMode ? "Đã chuyển sang chế độ sáng" : "Đã chuyển sang chế độ tối");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Đang tìm kiếm: ${searchQuery}`);
      // Thực hiện tìm kiếm ở đây
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  const navItems = [
    { path: "/about", label: "Về chúng tôi", icon: <FaInfoCircle /> },
    { path: "/daily", label: "Đánh giá hằng ngày", icon: <FaClipboardCheck /> },
    { path: "/products", label: "Sản phẩm sức khỏe", icon: <FaHeartbeat /> },
    { path: "/chatroom", label: "Tư vấn bác sĩ", icon: <FaUserMd /> },
    { path: "/deposit", label: "Nạp tiền", icon: <FaWallet /> },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 w-full h-16 z-50 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} shadow-lg px-4 md:px-8 flex items-center justify-between transition-colors duration-300`}>
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <img
              src={Bot}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Student Stress Helper
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex relative mx-4 flex-1 max-w-md">
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 pl-10 pr-4 rounded-full border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </form>
        </div>

        {/* Navigation Links - Desktop only */}
        <nav className="hidden lg:flex">
          <ul className="flex space-x-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium ${location.pathname === item.path 
                    ? (darkMode ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700') 
                    : (darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
                  } transition-all duration-200`}
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Actions */}
        <div className="flex items-center space-x-2 md:space-x-4 relative" ref={dropdownRef}>
          {/* Become Doctor - Desktop */}
          <Link
            to="/apply-doctor"
            className="hidden md:flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-full text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FaUserMd className="text-white" />
            <span>Trở thành bác sĩ</span>
          </Link>

          {/* Search Button - Mobile */}
          <button 
            onClick={handleSearchToggle}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <FaSearch />
          </button>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`flex items-center justify-center w-9 h-9 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors duration-300`}
            title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            title="Giỏ hàng"
          >
            <FaShoppingCart />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartItemsCount > 99 ? "99+" : cartItemsCount}
              </span>
            )}
          </Link>

          {/* Notification Button */}
          <button 
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            title="Thông báo"
          >
            <FaBell />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full border-2 border-white"></span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={handleMenuToggle}
            title="Menu"
          >
            <FaBars />
          </button>

          {/* User Profile Button */}
          <div className="relative hidden md:block">
            <button 
              onClick={handleMenuToggle} 
              className="flex items-center focus:outline-none"
              title="Tài khoản của tôi"
            >
              <div className="relative">
                <img
                  src={defaultImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-blue-500"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </button>
            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-64 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-xl py-2 z-50 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden transition-all duration-200`}>
                <div className="px-4 py-3 border-b border-gray-200 flex items-center space-x-3">
                  <img
                    src={defaultImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div>
                    <p className="font-medium">Nguyễn Văn A</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>student@example.com</p>
                  </div>
                </div>
                
                <div className="py-1">
                  <Link to="/user-profile" className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaUser className="mr-3 text-blue-500" />
                    Tài khoản của tôi
                  </Link>
                  <Link to="/orders" className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaHistory className="mr-3 text-green-500" />
                    Lịch sử đơn hàng
                  </Link>
                  <Link to="/settings" className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaCog className="mr-3 text-gray-500" />
                    Cài đặt
                  </Link>
                  <Link to="/help" className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaQuestionCircle className="mr-3 text-purple-500" />
                    Trợ giúp & Phản hồi
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 py-1">
                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                  >
                    <FaSignOutAlt className="mr-3" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed top-16 left-0 w-full bg-white shadow-md z-40 p-4 md:hidden" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden fixed top-16 left-0 w-full bg-white shadow-lg z-40 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 py-3 border-b border-gray-200 flex items-center space-x-3 md:hidden">
            <img
              src={defaultImage}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
            />
            <div>
              <p className="font-medium">Nguyễn Văn A</p>
              <p className="text-xs text-gray-500">student@example.com</p>
            </div>
          </div>
          
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu chính</p>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${location.pathname === item.path 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to="/apply-doctor" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  <FaUserMd />
                  Trở thành bác sĩ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-2 mt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tài khoản</p>
            <ul className="space-y-1">
              <li>
                <Link to="/user-profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <FaUser className="text-blue-500" />
                  Tài khoản của tôi
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <FaHistory className="text-green-500" />
                  Lịch sử đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <FaCog className="text-gray-500" />
                  Cài đặt
                </Link>
              </li>
              <li>
                <Link to="/help" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <FaQuestionCircle className="text-purple-500" />
                  Trợ giúp & Phản hồi
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-4 mt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <FaSignOutAlt />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}
