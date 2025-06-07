import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchUserInfo } from "../../lib/user/info";
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
  FaSun,
  FaUndo
} from "react-icons/fa";

export default function Header({ cartItemsCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef();
  const searchRef = useRef();
  const { user, logout } = useAuth();

  // Fetch user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const data = await fetchUserInfo();
          setUserProfile(data);
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
    };
    
    loadUserProfile();
  }, [user]);

  const handleMenuToggle = () => {
    console.log('Menu toggle clicked, current state:', menuOpen);
    setMenuOpen(!menuOpen);
  };
  
  const handleSearchToggle = () => setSearchOpen(!searchOpen);
  
  const handleLogout = async () => {
    console.log('Logout clicked');
    try {
      setMenuOpen(false);
      setSearchOpen(false);
      await logout();
      toast.success("Đăng xuất thành công!");
      
      // Force navigation
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Có lỗi khi đăng xuất!");
    }
  };

  // FIXED NAVIGATION APPROACH
  const forceNavigate = (path) => {
    console.log('Force navigate to:', path);
    
    // Close menu
    setMenuOpen(false);
    setSearchOpen(false);
    
    // Show loading toast
    toast.info(`Đang chuyển đến ${path}...`);
    
    // Use window.location.href for reliable mobile navigation
    setTimeout(() => {
      if (window.location.pathname !== path) {
        window.location.href = path;
      }
    }, 100);
  };

  // Mobile-specific navigation handler - FIXED
  const handleMobileClick = (path, e) => {
    console.log('Mobile click:', path);
    
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Force navigation
    forceNavigate(path);
  };
  // Create a simple Link component for mobile
  const MobileNavItem = ({ path, children, className, onClick }) => {
    return (
      <a
        href={path}
        onClick={(e) => {
          e.preventDefault();
          console.log('MobileNavItem clicked:', path);
          if (onClick) {
            onClick();
          } else {
            forceNavigate(path);
          }
        }}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          cursor: 'pointer'
        }}
      >
        {children}
      </a>
    );
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(darkMode ? "Đã chuyển sang chế độ sáng" : "Đã chuyển sang chế độ tối");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Đang tìm kiếm: ${searchQuery}`);
      setSearchOpen(false);
    }
  };

  // Close menu when clicking outside
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
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Auto close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Format user display name
  const getUserDisplayName = () => {
    if (userProfile) {
      const firstName = userProfile.firstName || '';
      const lastName = userProfile.lastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    return user?.email?.split('@')[0] || "Người dùng";
  };

  const getUserEmail = () => {
    return userProfile?.username || user?.email || "";
  };

  const navItems = [
    { path: "/about", label: "Về chúng tôi", icon: <FaInfoCircle /> },
    { path: "/daily", label: "Đánh giá hằng ngày", icon: <FaClipboardCheck /> },
    { path: "/products", label: "Sản phẩm sức khỏe", icon: <FaHeartbeat /> },
    { path: "/chatroom", label: "Tư vấn bác sĩ", icon: <FaUserMd /> },
    { path: "/chat-history", label: "Lịch sử chat", icon: <FaHistory /> },
    { path: "/deposit", label: "Nạp tiền", icon: <FaWallet /> },
    { path: "/refund-history", label: "Lịch sử hoàn tiền", icon: <FaUndo /> },
  ];

  const accountItems = [
    { path: '/user-profile', label: 'Tài khoản của tôi', icon: <FaUser className="text-blue-500 text-base" /> },
    { path: '/refund-history', label: 'Lịch sử hoàn tiền', icon: <FaUndo className="text-orange-500 text-base" /> },
    { path: '/orders', label: 'Lịch sử đơn hàng', icon: <FaHistory className="text-green-500 text-base" /> },
    { path: '/settings', label: 'Cài đặt', icon: <FaCog className="text-gray-500 text-base" /> },
    { path: '/help', label: 'Trợ giúp & Phản hồi', icon: <FaQuestionCircle className="text-purple-500 text-base" /> }
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 w-full h-14 sm:h-16 z-50 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} shadow-lg px-3 sm:px-4 md:px-8 flex items-center justify-between transition-colors duration-300`}>
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <div className="relative">
            <img
              src={Bot}
              alt="Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-500"
            />
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <span className={`font-bold text-sm sm:text-base lg:text-lg ${darkMode ? 'text-white' : 'text-gray-800'} hidden xs:block`}>
            Student Stress Helper
          </span>
          <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-800'} xs:hidden`}>
            SSH
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex relative mx-4 flex-1 max-w-md">
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
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Tìm kiếm"
          >
            <FaSearch />
          </button>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Giỏ hàng"
          >
            <FaShoppingCart />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-medium">
                {cartItemsCount > 99 ? "99+" : cartItemsCount}
              </span>
            )}
          </Link>

          {/* Notification Button */}
          <button 
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Thông báo"
          >
            <FaBell />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full border-2 border-white"></span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-95 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={handleMenuToggle}
            title="Menu"
          >
            <FaBars />
          </button>

          {/* User Profile Button - Desktop */}
          <div className="relative hidden md:block">
            <button 
              onClick={handleMenuToggle} 
              className="flex items-center focus:outline-none transition-all duration-200 active:scale-95"
              title="Tài khoản của tôi"
            >
              <div className="relative">
                <img
                  src={userProfile?.avtUrl || defaultImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-blue-500 hover:border-blue-600 transition-colors duration-200"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </button>
            
            {/* Desktop Dropdown Menu */}
            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-64 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-xl py-2 z-[200] border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden transition-all duration-200`}>
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center space-x-3`}>
                  <img
                    src={userProfile?.avtUrl || defaultImage}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div>
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getUserEmail()}</p>
                  </div>
                </div>
                
                <div className="py-1">
                  {accountItems.map((item) => (
                    <Link 
                      key={item.path}
                      to={item.path} 
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-100 active:bg-gray-200'}`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  ))}
                </div>
                
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-1`}>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${darkMode ? 'text-red-400 hover:bg-gray-700 active:bg-gray-600' : 'text-red-600 hover:bg-gray-100 active:bg-gray-200'}`}
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
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[150]"
            onClick={() => setSearchOpen(false)}
          />
          
          <div className={`fixed top-16 left-0 w-full ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-md z-[151] p-4 md:hidden transition-colors duration-300`} ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-3 pl-12 pr-4 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                autoFocus
              />
              <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Tìm
              </button>
            </form>
          </div>
        </>
      )}

      {/* COMPLETELY REWRITTEN Mobile Menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: 998 }}
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Mobile Menu Container */}
          <div 
            className={`lg:hidden fixed top-16 left-0 w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} shadow-lg py-4 max-h-[calc(100vh-4rem)] overflow-y-auto`}
            style={{ zIndex: 999 }}
          >
            {/* User Profile Section */}
            <div className={`px-6 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center space-x-3 md:hidden`}>
              <img
                src={userProfile?.avtUrl || defaultImage}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <p className="font-medium">{getUserDisplayName()}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getUserEmail()}</p>
              </div>
            </div>

            {/* Main Navigation - Using MobileNavItem */}
            <div className="px-4 py-2">
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-3`}>Menu chính</p>
              
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.path}
                  path={item.path}
                  className={`gap-3 px-4 py-4 rounded-lg mb-2 transition-all duration-200 ${
                    location.pathname === item.path 
                      ? (darkMode ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700')
                      : (darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
                  }`}
                >
                  <span className="text-base mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </MobileNavItem>
              ))}
              
              {/* Apply Doctor Button */}
              <MobileNavItem
                path="/apply-doctor"
                className="gap-3 px-4 py-4 rounded-lg mb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                <FaUserMd className="text-base mr-3" />
                <span className="font-medium">Trở thành bác sĩ</span>
              </MobileNavItem>
            </div>

            {/* Account Section */}
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-2 mt-3`}>
              <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-3`}>Tài khoản</p>
              
              {accountItems.map((item) => (
                <MobileNavItem
                  key={item.path}
                  path={item.path}
                  className={`gap-3 px-4 py-4 rounded-lg mb-2 transition-all duration-200 ${
                    darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </MobileNavItem>
              ))}
            </div>
            
            {/* Logout Section */}
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-4 mt-3`}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-200 ${
                  darkMode ? 'text-red-400 hover:bg-gray-800' : 'text-red-600 hover:bg-red-50'
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <FaSignOutAlt className="text-base" />
                <span className="font-medium">Đăng xuất</span>
              </a>
            </div>
          </div>
        </>
      )}
      
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}