import { FaChartBar, FaUser, FaProjectDiagram, FaBars } from "react-icons/fa";
import { FaMusic } from "react-icons/fa6";
import { FaUserDoctor } from "react-icons/fa6";
import { FaPhotoVideo } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaShoppingBag } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div className={`bg-white h-screen fixed left-0 top-0 transition-all duration-300 shadow-lg 
                    ${isOpen ? "w-64" : "w-20"} flex flex-col`}>
      {/* Toggle Button */}
      <div className="p-4 flex justify-between">
        <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none">
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar Menu */}
      <nav className="flex flex-col space-y-6 mt-6">
        <SidebarItem to="/admin-dashboard" icon={<FaChartBar />} label="DashBoard" isOpen={isOpen} />
        <SidebarItem to="/admin-role" icon={<FaProjectDiagram />} label="Role" isOpen={isOpen} />
        <SidebarItem to="/admin-user" icon={<FaUser />} label="User" isOpen={isOpen} />
        <SidebarItem to="/admin-doctor" icon={<FaUserDoctor />} label="Doctor" isOpen={isOpen} />
        <SidebarItem to="/admin-doctor-schedule" icon={<FaCalendarAlt />} label="Doctor Schedule" isOpen={isOpen} />
        <SidebarItem to="/admin-teacher" icon={<FaChalkboardTeacher />} label="Teacher" isOpen={isOpen} />
        <SidebarItem to="/admin-products" icon={<FaShoppingBag />} label="Products" isOpen={isOpen} />
        <SidebarItem to="/admin-questions" icon={<FaQuestionCircle />} label="Questions" isOpen={isOpen} />
        <SidebarItem to="/admin-music" icon={<FaMusic />} label="Music" isOpen={isOpen} />
        <SidebarItem to="/admin-video" icon={<FaPhotoVideo />} label="Video" isOpen={isOpen} />
        <SidebarItem to="/admin-deposits" icon={<FaMoneyBillWave />} label="Deposits" isOpen={isOpen} />
      </nav>
    </div>
  );
}

function SidebarItem({ to, icon, label, isOpen }) {
  return (
    <Link to={to} className="flex items-center space-x-4 px-4 py-2 text-gray-700 hover:bg-gray-100">
      <span>{icon}</span>
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}
