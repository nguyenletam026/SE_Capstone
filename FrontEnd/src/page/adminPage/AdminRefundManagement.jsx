import { useEffect, useState } from "react";
import { getAllRefunds, getRefundStatistics } from "../../lib/admin/adminServices";
import { 
  HiCurrencyDollar, 
  HiRefresh, 
  HiExclamationCircle,
  HiCheckCircle,
  HiSearch,
  HiFilter,
  HiDownload
} from "react-icons/hi";

const AdminRefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRefundData();
  }, []);

  const fetchRefundData = async () => {
    setLoading(true);
    try {
      const [refundData, statsData] = await Promise.all([
        getAllRefunds(),
        getRefundStatistics()
      ]);
      setRefunds(refundData);
      setStatistics(statsData);
    } catch (error) {
      console.error("Error fetching refund data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getReasonColor = (reason) => {
    const colors = {
      'DOCTOR_NO_RESPONSE': 'bg-red-100 text-red-800',
      'PATIENT_REQUEST': 'bg-blue-100 text-blue-800',
      'TECHNICAL_ISSUE': 'bg-yellow-100 text-yellow-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    return colors[reason] || 'bg-gray-100 text-gray-800';
  };

  const getReasonText = (reason) => {
    const texts = {
      'DOCTOR_NO_RESPONSE': 'Bác sĩ không phản hồi',
      'PATIENT_REQUEST': 'Yêu cầu của bệnh nhân',
      'TECHNICAL_ISSUE': 'Sự cố kỹ thuật',
      'OTHER': 'Khác'
    };
    return texts[reason] || reason;
  };

  // Filter refunds
  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = 
      refund.patientName.toLowerCase().includes(filter.toLowerCase()) ||
      refund.doctorName.toLowerCase().includes(filter.toLowerCase()) ||
      refund.id.toLowerCase().includes(filter.toLowerCase());
    
    const matchesReason = reasonFilter === "ALL" || refund.refundReason === reasonFilter;
    
    return matchesSearch && matchesReason;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRefunds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = ['ID', 'Bệnh nhân', 'Bác sĩ', 'Số tiền', 'Lý do', 'Ngày hoàn tiền'];
    const csvContent = [
      headers.join(','),
      ...filteredRefunds.map(refund => [
        refund.id,
        refund.patientName,
        refund.doctorName,
        refund.refundAmount,
        getReasonText(refund.refundReason),
        formatDate(refund.refundedAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `refunds_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-full mx-auto">      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">💰 Refund Management</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchRefundData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <HiRefresh className="text-lg" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <HiDownload className="text-lg" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalRefunds || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <HiRefresh className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount Refunded</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics.totalAmount || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <HiCurrencyDollar className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Most Common Reason</p>
              <p className="text-sm font-bold text-gray-900">
                {Object.keys(statistics.refundsByReason || {}).length > 0 
                  ? getReasonText(Object.keys(statistics.refundsByReason).reduce((a, b) => 
                      statistics.refundsByReason[a] > statistics.refundsByReason[b] ? a : b))
                  : "No data available"
                }
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <HiExclamationCircle className="text-2xl text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />              <input
                type="text"
                placeholder="Search by patient name, doctor name or ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              >
                <option value="ALL">All reasons</option>
                <option value="DOCTOR_NO_RESPONSE">Doctor no response</option>
                <option value="PATIENT_REQUEST">Patient request</option>
                <option value="TECHNICAL_ISSUE">Technical issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((refund) => (
                <tr key={refund.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {refund.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {refund.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {refund.doctorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(refund.refundAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(refund.refundReason)}`}>
                      {getReasonText(refund.refundReason)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(refund.refundedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <HiCheckCircle className="mr-1" />
                      Refunded
                    </span>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <HiExclamationCircle className="text-4xl text-gray-300 mb-2" />
                      <p>No refund data found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredRefunds.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredRefunds.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRefundManagement;
