import React, { useState, useEffect } from 'react';
import { 
  createWithdrawalRequest, 
  getDoctorWithdrawalRequests,
  getDoctorEarningsStats 
} from '../../lib/doctor/earningsService';

const DoctorWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    bankAccount: '',
    bankName: '',
    accountHolderName: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [withdrawalsData, statsData] = await Promise.all([
        getDoctorWithdrawalRequests(),
        getDoctorEarningsStats()
      ]);
      
      setWithdrawals(withdrawalsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.bankAccount || !formData.bankName || !formData.accountHolderName) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }    const amount = parseFloat(formData.amount);
    if (amount <= 0 || amount > (stats.currentBalance || 0)) {
      alert('Số tiền rút không hợp lệ');
      return;
    }

    try {
      setCreateLoading(true);
      await createWithdrawalRequest({
        ...formData,
        amount: amount
      });
      
      alert('Yêu cầu rút tiền đã được tạo thành công!');
      setShowCreateModal(false);
      setFormData({
        amount: '',
        bankAccount: '',
        bankName: '',
        accountHolderName: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      alert('Có lỗi xảy ra khi tạo yêu cầu rút tiền');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800'
    };

    const statusTexts = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      COMPLETED: 'Hoàn thành'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
        {statusTexts[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rút tiền</h1>
          <p className="text-gray-600">Quản lý yêu cầu rút tiền từ thu nhập tư vấn</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tạo yêu cầu rút tiền</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Số dư có thể rút</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.currentBalance || 0)}
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
            </div>            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đang chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(
                  withdrawals
                    .filter(w => w.status === 'PENDING')
                    .reduce((sum, w) => sum + w.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  withdrawals
                    .filter(w => w.status === 'APPROVED')
                    .reduce((sum, w) => sum + w.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Đã rút thành công</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  withdrawals
                    .filter(w => w.status === 'COMPLETED')
                    .reduce((sum, w) => sum + w.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bị từ chối</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  withdrawals
                    .filter(w => w.status === 'REJECTED')
                    .reduce((sum, w) => sum + w.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lịch sử yêu cầu rút tiền</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngân hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tài khoản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Chưa có yêu cầu rút tiền nào
                  </td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(withdrawal.requestedAt || withdrawal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {withdrawal.bankName || withdrawal.bank || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {withdrawal.accountNumber || withdrawal.bankAccount || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openDetailsModal(withdrawal)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-gray-900">Chi tiết yêu cầu rút tiền</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedWithdrawal(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Withdrawal Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Thông tin rút tiền</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Số tiền:</span>
                      <p className="font-medium text-blue-600 text-lg">
                        {formatCurrency(selectedWithdrawal.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <div className="mt-1">
                        {getStatusBadge(selectedWithdrawal.status)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ngày yêu cầu:</span>
                      <p className="font-medium">
                        {formatDate(selectedWithdrawal.requestedAt || selectedWithdrawal.createdAt)}
                      </p>
                    </div>
                    {selectedWithdrawal.processedAt && (
                      <div>
                        <span className="text-sm text-gray-600">Ngày xử lý:</span>
                        <p className="font-medium">
                          {formatDate(selectedWithdrawal.processedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Thông tin ngân hàng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Tên ngân hàng:</span>
                      <p className="font-medium">{selectedWithdrawal.bankName || selectedWithdrawal.bank || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Số tài khoản:</span>
                      <p className="font-medium">{selectedWithdrawal.accountNumber || selectedWithdrawal.bankAccount || 'N/A'}</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <span className="text-sm text-gray-600">Tên chủ tài khoản:</span>
                      <p className="font-medium">{selectedWithdrawal.accountHolderName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedWithdrawal.adminNote && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Ghi chú của admin</h4>
                    <p className="text-gray-700">{selectedWithdrawal.adminNote}</p>
                  </div>
                )}

                {/* Transfer Proof Section */}
                {selectedWithdrawal.transferProofUrl ? (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Chứng từ chuyển tiền</h4>
                    <div className="mt-2">
                      {selectedWithdrawal.transferProofUrl.toLowerCase().includes('.pdf') ? (
                        // PDF View
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                          <div className="p-3 bg-red-100 rounded-lg">
                            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Chứng từ chuyển tiền (PDF)</p>
                            <p className="text-sm text-gray-500">Nhấp vào nút bên dưới để xem file PDF</p>
                            <button
                              onClick={() => window.open(selectedWithdrawal.transferProofUrl, '_blank')}
                              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>Xem file PDF</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Image View
                        <div>
                          <p className="text-sm text-gray-600 mb-3">Chứng từ chuyển tiền từ admin:</p>
                          <div className="relative bg-white rounded-lg border p-2">
                            <img
                              src={selectedWithdrawal.transferProofUrl}
                              alt="Chứng từ chuyển tiền"
                              className="max-w-full h-auto rounded-lg shadow-md"
                              style={{ maxHeight: '400px', margin: '0 auto', display: 'block' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div style={{ display: 'none' }} className="text-center py-8">
                              <p className="text-gray-500">Không thể tải ảnh chứng từ</p>
                            </div>
                          </div>
                          <div className="mt-3 text-center">
                            <button
                              onClick={() => window.open(selectedWithdrawal.transferProofUrl, '_blank')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                              <span>Xem ảnh full size</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // No Transfer Proof
                  selectedWithdrawal.status === 'COMPLETED' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Chứng từ chuyển tiền</h4>
                      <div className="text-center py-6">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">Chưa có chứng từ chuyển tiền</p>
                        <p className="text-sm text-gray-400 mt-1">Admin sẽ cập nhật chứng từ sau khi hoàn tất chuyển tiền</p>
                      </div>
                    </div>
                  )
                )}

                {/* Status-specific messages */}
                {selectedWithdrawal.status === 'PENDING' && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-yellow-800">Yêu cầu đang được xử lý. Vui lòng chờ admin duyệt.</p>
                    </div>
                  </div>
                )}

                {selectedWithdrawal.status === 'APPROVED' && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-blue-800">Yêu cầu đã được duyệt. Admin sẽ thực hiện chuyển tiền trong thời gian sớm nhất.</p>
                    </div>
                  </div>
                )}

                {selectedWithdrawal.status === 'COMPLETED' && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-green-800">Yêu cầu đã hoàn thành. Tiền đã được chuyển vào tài khoản của bạn.</p>
                    </div>
                  </div>
                )}

                {selectedWithdrawal.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-800">Yêu cầu đã bị từ chối. Vui lòng xem ghi chú của admin để biết chi tiết.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedWithdrawal(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Withdrawal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tạo yêu cầu rút tiền</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền rút (VND)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}                    max={stats.currentBalance || 0}
                    min="1000"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số tiền muốn rút"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Số dư khả dụng: {formatCurrency(stats.currentBalance || 0)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên ngân hàng
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Vietcombank, BIDV, Techcombank..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số tài khoản ngân hàng"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên chủ tài khoản
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên chủ tài khoản"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    disabled={createLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={createLoading}
                  >
                    {createLoading ? 'Đang tạo...' : 'Tạo yêu cầu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorWithdrawals;
