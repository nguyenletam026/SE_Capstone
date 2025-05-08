import {
  FaChartBar,
  FaUser,
  FaProjectDiagram,
  FaBars,
  FaPhotoVideo,
  FaChalkboardTeacher,
  FaShoppingBag,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaQuestionCircle,
  FaCog,
} from "react-icons/fa";
import { FaMusic, FaUserDoctor } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const sidebarItems = [
  { to: "/admin-dashboard", icon: <FaChartBar />, label: "Dashboard" },
  { to: "/admin-role", icon: <FaProjectDiagram />, label: "Role" },
  { to: "/admin-user", icon: <FaUser />, label: "User" },
  { to: "/admin-doctor", icon: <FaUserDoctor />, label: "Doctor" },
  { to: "/admin-doctor-schedule", icon: <FaCalendarAlt />, label: "Doctor Schedule" },
  { to: "/admin-teacher", icon: <FaChalkboardTeacher />, label: "Teacher" },
  { to: "/admin-products", icon: <FaShoppingBag />, label: "Products" },
  { to: "/admin-questions", icon: <FaQuestionCircle />, label: "Questions" },
  { to: "/admin-music", icon: <FaMusic />, label: "Music" },
  { to: "/admin-video", icon: <FaPhotoVideo />, label: "Video" },
  { to: "/admin-deposits", icon: <FaMoneyBillWave />, label: "Deposits" },
  { to: "/admin-settings", icon: <FaCog />, label: "Setting" },
  { to: "/admin-order", icon: <FaShoppingBag />, label: "Order Management" },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  return (
    <div
      className={`
        h-screen fixed left-0 top-0 z-30 transition-all duration-300
        ${isOpen ? "w-64" : "w-20"}
        bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600
        shadow-2xl flex flex-col
      `}
      style={{
        borderTopRightRadius: "24px",
        borderBottomRightRadius: "24px",
      }}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={toggleSidebar}
          className="text-white hover:bg-white/10 p-2 rounded-full transition"
        >
          <FaBars size={26} />
        </button>
        {isOpen && (
          <span className="ml-2 text-xl font-bold text-white tracking-wider select-none">
            Admin
          </span>
        )}
      </div>
      <div className="flex-1 mt-4">
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item, idx) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isOpen={isOpen}
              active={location.pathname === item.to}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              showTooltip={!isOpen && hovered === idx}
            />
          ))}
        </nav>
      </div>
      <div className="mb-4 text-center">
        {isOpen && (
          <span className="text-xs text-white/70">&copy; 2025 Your Company</span>
        )}
      </div>
    </div>
  );
}

function SidebarItem({ to, icon, label, isOpen, active, onMouseEnter, onMouseLeave, showTooltip }) {
  return (
    <div className="relative">
      <Link
        to={to}
        className={`
          group flex items-center gap-4 px-4 py-3 rounded-lg mx-2 transition-all
          ${active
            ? "bg-white/90 text-indigo-700 font-semibold shadow-lg"
            : "text-white/80 hover:bg-indigo-700/40 hover:shadow"
          }
        `}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <span
          className={`
            text-2xl transition
            ${active ? "text-indigo-600 drop-shadow-md" : "group-hover:text-white"}
          `}
        >
          {icon}
        </span>
        {isOpen && (
          <span className="text-sm tracking-wide">{label}</span>
        )}
      </Link>
      {/* Tooltip for collapsed sidebar */}
      {showTooltip && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 rounded bg-gray-900 text-white text-xs shadow-lg whitespace-nowrap z-50 animate-fadein">
          {label}
        </div>
      )}
    </div>
  );
}

/* Add this to your CSS or tailwind.config for fadein animation if using Tailwind:
@layer utilities {
  .animate-fadein {
    animation: fadeIn 0.18s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px);}
    to { opacity: 1; transform: translateY(0);}
  }
}
*/