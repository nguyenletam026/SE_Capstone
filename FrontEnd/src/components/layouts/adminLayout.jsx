import { useState } from "react";
import Sidebar from "../utils/Sidebar";
import AdminHeader from "../header/adminHeader";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <AdminHeader />
        <div className="p-6 mt-16">{/* Add margin for fixed header */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
