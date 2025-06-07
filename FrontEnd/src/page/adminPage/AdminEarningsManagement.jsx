import React, { useState, useEffect } from 'react';
import { 
  adminGetAllEarnings,
  adminGetEarningsByStatus,
  adminGetPlatformFees,
  adminConfirmEarning 
} from '../../lib/doctor/earningsService';

const AdminEarningsManagement = () => {
  const [earnings, setEarnings] = useState([]);
  const [platformFees, setPlatformFees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [earningsData, feesData] = await Promise.all([
        selectedStatus === 'ALL' ? adminGetAllEarnings() : adminGetEarningsByStatus(selectedStatus),
        adminGetPlatformFees()
      ]);
      
      setEarnings(earningsData);
      setPlatformFees(feesData);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmEarning = async (earningId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Bạn có chắc chắn muốn xác nhận thu nhập này?')) {
      return;
    }

    try {
      setConfirmingId(earningId);
      await adminConfirmEarning(earningId);
      alert('Xác nhận thu nhập thành công!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error confirming earning:', error);
      alert('Có lỗi xảy ra khi xác nhận thu nhập');
    } finally {
      setConfirmingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      WITHDRAWN: 'bg-blue-100 text-blue-800'
    };

    const statusTexts = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      WITHDRAWN: 'Đã rút'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusTexts[status]}
      </span>
    );
  };

  const getEarningsStats = () => {
    const pending = earnings.filter(e => e.status === 'PENDING');
    const confirmed = earnings.filter(e => e.status === 'CONFIRMED');
    const withdrawn = earnings.filter(e => e.status === 'WITHDRAWN');

    return {
      totalEarnings: earnings.reduce((sum, e) => sum + e.doctorEarning, 0),
      pendingEarnings: pending.reduce((sum, e) => sum + e.doctorEarning, 0),
      confirmedEarnings: confirmed.reduce((sum, e) => sum + e.doctorEarning, 0),
      withdrawnEarnings: withdrawn.reduce((sum, e) => sum + e.doctorEarning, 0),
      totalCount: earnings.length,
      pendingCount: pending.length
    };
  };

  const stats = getEarningsStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý thu nhập bác sĩ</h1>
        <p className="text-gray-600">Theo dõi và xác nhận thu nhập của các bác sĩ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng thu nhập BS</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.pendingEarnings)}
              </p>
              <p className="text-xs text-gray-500">{stats.pendingCount} giao dịch</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã xác nhận</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.confirmedEarnings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Thu nhập nền tảng</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(platformFees)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Danh sách thu nhập</h3>
            <div className="flex space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="WITHDRAWN">Đã rút</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thu nhập BS (70%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phí nền tảng (30%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earnings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Không có dữ liệu thu nhập
                  </td>
                </tr>
              ) : (
                earnings.map((earning) => (
                  <tr key={earning.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={earning.doctor.avtUrl || '/default-avatar.png'} 
                            alt="" 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {earning.doctor.firstName} {earning.doctor.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{earning.doctor.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(earning.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(earning.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(earning.doctorEarning)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(earning.platformFee)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(earning.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {earning.status === 'PENDING' && (
                        <button
                          onClick={() => handleConfirmEarning(earning.id)}
                          disabled={confirmingId === earning.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {confirmingId === earning.id ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                      )}
                      {earning.status === 'CONFIRMED' && (
                        <span className="text-gray-400">Đã xác nhận</span>
                      )}
                      {earning.status === 'WITHDRAWN' && (
                        <span className="text-gray-400">Đã rút tiền</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEarningsManagement;
