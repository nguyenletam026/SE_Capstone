import { useEffect, useState } from "react";
import { getAllConsultations } from "../../lib/admin/adminServices";
import { 
  HiSearch, 
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineChat,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineCalendar
} from "react-icons/hi";
import { 
  FaRegCheckCircle, 
  FaRegTimesCircle, 
  FaRegClock,
  FaRegUser,
  FaRegCalendarAlt
} from "react-icons/fa";
import { 
  RiStethoscopeLine, 
  RiUserHeartLine,
  RiRefund2Line
} from "react-icons/ri";

const AdminManageConsultation = ({ title }) => {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    type: "all", // all, today, week, month, custom
    startDate: "",
    endDate: ""
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expired: 0,
    refunded: 0,
    totalRevenue: 0,
    totalRefunded: 0
  });

  useEffect(() => {
    fetchConsultations();
  }, []);
  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, filterStatus, dateFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const data = await getAllConsultations();
      setConsultations(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const now = new Date();
    const stats = {
      total: data.length,
      active: data.filter(c => new Date(c.expiresAt) > now && !c.refunded).length,
      expired: data.filter(c => new Date(c.expiresAt) <= now && !c.refunded).length,
      refunded: data.filter(c => c.refunded).length,
      totalRevenue: data.reduce((sum, c) => sum + (c.refunded ? 0 : c.amount), 0),
      totalRefunded: data.reduce((sum, c) => sum + (c.refunded ? c.refundAmount || 0 : 0), 0)
    };
    setStatistics(stats);
  };
  const filterConsultations = () => {
    let filtered = consultations;
    const now = new Date();

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (consultation) =>
          consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultation.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((consultation) => {
        switch (filterStatus) {
          case "active":
            return new Date(consultation.expiresAt) > now && !consultation.refunded;
          case "expired":
            return new Date(consultation.expiresAt) <= now && !consultation.refunded;
          case "refunded":
            return consultation.refunded;
          default:
            return true;
        }
      });
    }

    // Apply date filter
    if (dateFilter.type !== "all") {
      let startDate, endDate;

      switch (dateFilter.type) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          startDate = startOfWeek;
          endDate = new Date(startOfWeek);
          endDate.setDate(startOfWeek.getDate() + 7);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "custom":
          if (dateFilter.startDate) {
            startDate = new Date(dateFilter.startDate);
            startDate.setHours(0, 0, 0, 0);
          }
          if (dateFilter.endDate) {
            endDate = new Date(dateFilter.endDate);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        default:
          break;
      }

      if (startDate || endDate) {
        filtered = filtered.filter(consultation => {
          const consultationDate = new Date(consultation.createdAt);
          
          if (startDate && endDate) {
            return consultationDate >= startDate && consultationDate <= endDate;
          } else if (startDate) {
            return consultationDate >= startDate;
          } else if (endDate) {
            return consultationDate <= endDate;
          }
          
          return true;
        });
      }
    }

    setFilteredConsultations(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (consultation) => {
    const now = new Date();
    const expiresAt = new Date(consultation.expiresAt);
    
    if (consultation.refunded) {
      return (        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <RiRefund2Line className="w-3 h-3 mr-1" />
          Refunded
        </span>
      );
    } else if (expiresAt > now) {
      return (        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaRegCheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <FaRegClock className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title || "Consultation Management"}
          </h1>
          <p className="text-gray-600">
            Monitor and manage all patient consultation sessions with doctors
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">          <StatCard
            title="Total Consultations"
            value={statistics.total}
            icon={HiOutlineChat}
            color="bg-blue-500"
            subtitle="All consultation sessions"
          />
          <StatCard
            title="Active"
            value={statistics.active}
            icon={HiOutlineClipboardCheck}
            color="bg-green-500"
            subtitle="Ongoing consultation sessions"
          />
          <StatCard
            title="Expired"
            value={statistics.expired}
            icon={HiOutlineClock}
            color="bg-gray-500"
            subtitle="Completed consultation sessions"
          />
          <StatCard
            title="Refunded"
            value={statistics.refunded}
            icon={RiRefund2Line}
            color="bg-red-500"
            subtitle="Refunded consultation sessions"
          />
        </div>        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(statistics.totalRevenue)}
            icon={HiOutlineCurrencyDollar}
            color="bg-green-600"
            subtitle="Revenue from consultations"
          />
          <StatCard
            title="Total Refunded"
            value={formatCurrency(statistics.totalRefunded)}
            icon={HiOutlineExclamationCircle}
            color="bg-red-600"
            subtitle="Amount refunded to patients"
          />
        </div>{/* Filters and Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col gap-4">
            {/* First Row - Search and Status Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />                  <input
                    type="text"
                    placeholder="Search patient, doctor or ID..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <HiOutlineFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Refresh Button */}              <button
                onClick={fetchConsultations}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiOutlineRefresh className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>

            {/* Second Row - Date Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Date Filter Type */}
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={dateFilter.type}
                  onChange={(e) => setDateFilter({...dateFilter, type: e.target.value})}
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {dateFilter.type === "custom" && (
                <>                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">From date:</label>
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">To date:</label>
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                    />
                  </div>
                </>
              )}

              {/* Clear Filters Button */}
              {(searchTerm || filterStatus !== "all" || dateFilter.type !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setDateFilter({type: "all", startDate: "", endDate: ""});
                  }}                  className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Consultations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consultation Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <HiOutlineChat className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            #{consultation.id.substring(0, 8)}
                          </div>                          <div className="text-sm text-gray-500">
                            {consultation.hours} consultation hours
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaRegUser className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.patientName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <RiStethoscopeLine className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.doctorName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <FaRegCalendarAlt className="h-3 w-3 text-gray-400 mr-1" />
                          Created: {formatDateTime(consultation.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <FaRegClock className="h-3 w-3 text-gray-400 mr-1" />
                          Expires: {formatDateTime(consultation.expiresAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(consultation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium text-green-600">
                          {formatCurrency(consultation.amount)}
                        </div>                        {consultation.refunded && (
                          <div className="text-red-600 text-xs">
                            Refunded: {formatCurrency(consultation.refundAmount || 0)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>          {filteredConsultations.length === 0 && (
            <div className="text-center py-12">
              <HiOutlineChat className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No consultations found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== "all" || dateFilter.type !== "all"
                  ? "No consultations match the current filters."
                  : "No consultation sessions have been created yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageConsultation;
