import { FaChartBar, FaShoppingCart, FaProjectDiagram, FaBars } from "react-icons/fa";
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
        <SidebarItem to="/admin-dashboard" icon={<FaChartBar />} label="Analytics" isOpen={isOpen} />
        <SidebarItem to="/ecommerce" icon={<FaShoppingCart />} label="Ecommerce" isOpen={isOpen} />
        <SidebarItem to="/projects" icon={<FaProjectDiagram />} label="Project" isOpen={isOpen} />
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
