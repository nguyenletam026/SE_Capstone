// 📁 pages/AdminHome.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/utils/Sidebar";
import AdminHeader from "../../components/header/adminHeader";
import StatsCard from "../../components/utils/StatsCard";
import Chart from "../../components/utils/Chart";

export default function AdminHome() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user]);

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Header */}
        <AdminHeader user={user} />

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard title="All Users" value="10,234" color="purple" />
            <StatsCard title="Event Count" value="536" color="orange" />
            <StatsCard title="Conversations" value="21" color="green" />
            <StatsCard title="New Users" value="3,321" color="blue" />
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
            <Chart />
          </div>
        </div>
      </div>
    </div>
  );
}
