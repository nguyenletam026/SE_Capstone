import React, { useState, useEffect } from 'react';
import Card from '../../components/utils/Card';
import Button from '../../components/utils/Button';
import Badge from '../../components/utils/Badge';
import Input from '../../components/utils/Input';
import Textarea from '../../components/utils/Textarea';
import Modal from '../../components/utils/Modal';
import { 
  adminGetAllWithdrawals, 
  approveWithdrawal, 
  rejectWithdrawal,
  updateTransferProof 
} from '../../lib/doctor/earningsService';
import { format } from 'date-fns';

const AdminWithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [statistics, setStatistics] = useState({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalWithdrawalAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchWithdrawals();
    fetchStatistics();
  }, []);  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await adminGetAllWithdrawals();
      console.log('Withdrawal data received:', data);
      
      // Log first withdrawal to check doctor info
      if (data && data.length > 0) {
        console.log('First withdrawal doctor info:', {
          doctorName: data[0].doctorName,
          doctorEmail: data[0].doctorEmail,
          doctorPhone: data[0].doctorPhone,
          doctorSpecialty: data[0].doctorSpecialty
        });
      }
      
      setWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStatistics = async () => {
    try {
      // For now, calculate statistics from withdrawals data
      // This should ideally come from a dedicated statistics endpoint
      const data = await adminGetAllWithdrawals();
      const stats = {
        totalWithdrawals: data.length,
        pendingWithdrawals: data.filter(w => w.status === 'PENDING').length,
        approvedWithdrawals: data.filter(w => w.status === 'APPROVED').length,
        rejectedWithdrawals: data.filter(w => w.status === 'REJECTED').length,
        totalWithdrawalAmount: data.reduce((sum, w) => sum + (w.amount || 0), 0),
        pendingAmount: data.filter(w => w.status === 'PENDING').reduce((sum, w) => sum + (w.amount || 0), 0)
      };
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching withdrawal statistics:', error);
    }
  };  const handleApproveWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    try {
      await approveWithdrawal(selectedWithdrawal.id, {
        adminNote: actionNote,
        transferProof: proofFile
      });
      setShowApproveModal(false);
      setActionNote('');
      setProofFile(null);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
      fetchStatistics();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    try {
      await rejectWithdrawal(selectedWithdrawal.id, {
        adminNote: actionNote
      });
      setShowRejectModal(false);
      setActionNote('');
      setSelectedWithdrawal(null);
      fetchWithdrawals();
      fetchStatistics();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
    }  };
  const handleUploadProof = async () => {
    if (!selectedWithdrawal || !proofFile) return;

    try {
      // Use the updateTransferProof function to associate the proof with the withdrawal request
      await updateTransferProof(selectedWithdrawal.id, proofFile);
      setShowUploadModal(false);
      setProofFile(null);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
      alert('Chứng từ đã được upload và liên kết thành công!');
    } catch (error) {
      console.error('Error uploading transfer proof:', error);
      alert('Có lỗi xảy ra khi upload chứng từ');
    }
  };
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'yellow', text: 'Đang chờ' },
      APPROVED: { color: 'green', text: 'Đã duyệt' },
      REJECTED: { color: 'red', text: 'Đã từ chối' },
      COMPLETED: { color: 'blue', text: 'Hoàn thành' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Badge variant={config.color}>{config.text}</Badge>;
  };

  const getStatusBadgeVariant = (status) => {
    const statusConfig = {
      PENDING: 'yellow',
      APPROVED: 'green',
      REJECTED: 'red',
      COMPLETED: 'blue'
    };
    return statusConfig[status] || 'gray';
  };

  const getStatusText = (status) => {
    const statusConfig = {
      PENDING: 'Đang chờ',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Đã từ chối',
      COMPLETED: 'Hoàn thành'
    };
    return statusConfig[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => 
    statusFilter === 'ALL' || withdrawal.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý rút tiền</h1>
          <p className="text-gray-600">Quản lý các yêu cầu rút tiền từ bác sĩ</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Tổng yêu cầu</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.pendingWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Đang chờ</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {statistics.approvedWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Đã duyệt</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {statistics.rejectedWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Đã từ chối</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(statistics.totalWithdrawalAmount)}
            </div>
            <p className="text-sm text-gray-600">Tổng tiền rút</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(statistics.pendingAmount)}
            </div>
            <p className="text-sm text-gray-600">Tiền chờ duyệt</p>
          </Card.Content>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Đang chờ</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>
        </Card.Content>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <Card.Header>
          <Card.Title>Danh sách yêu cầu rút tiền</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bác sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngân hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày yêu cầu
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
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {withdrawal.doctorName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {withdrawal.doctorEmail || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </div>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {withdrawal.bankName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.accountNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.accountHolderName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(withdrawal.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">                      {withdrawal.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowApproveModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Từ chối
                          </Button>
                        </>
                      )}                      {(withdrawal.status === 'APPROVED' || withdrawal.status === 'COMPLETED') && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowUploadModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {withdrawal.transferProofUrl ? 'Up lại chứng từ' : 'Up chứng từ'}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setShowDetailsModal(true);
                        }}
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWithdrawals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có yêu cầu rút tiền nào
            </div>
          )}
        </Card.Content>
      </Card>      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setActionNote('');
          setProofFile(null);
          setSelectedWithdrawal(null);
        }}
        title="Duyệt yêu cầu rút tiền"
      >
        <div className="space-y-4">          <div>
            <p className="text-sm text-gray-600 mb-2">
              Bạn có chắc chắn muốn duyệt yêu cầu rút tiền của{' '}
              <span className="font-medium">{selectedWithdrawal?.doctorName}</span>{' '}
              với số tiền{' '}
              <span className="font-medium text-green-600">
                {formatCurrency(selectedWithdrawal?.amount || 0)}
              </span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chứng từ chuyển tiền <span className="text-red-500">*</span>
            </label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Chọn file ảnh hoặc PDF làm chứng từ chuyển tiền
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Nhập ghi chú cho quyết định duyệt..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setActionNote('');
                setProofFile(null);
                setSelectedWithdrawal(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleApproveWithdrawal}
              disabled={!proofFile}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Xác nhận duyệt
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setActionNote('');
          setSelectedWithdrawal(null);
        }}
        title="Từ chối yêu cầu rút tiền"
      >
        <div className="space-y-4">          <div>
            <p className="text-sm text-gray-600 mb-2">
              Bạn có chắc chắn muốn từ chối yêu cầu rút tiền của{' '}
              <span className="font-medium">{selectedWithdrawal?.doctorName}</span>{' '}
              với số tiền{' '}
              <span className="font-medium text-red-600">
                {formatCurrency(selectedWithdrawal?.amount || 0)}
              </span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Nhập lý do từ chối yêu cầu rút tiền..."
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setActionNote('');
                setSelectedWithdrawal(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleRejectWithdrawal}
              disabled={!actionNote.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              Xác nhận từ chối
            </Button>
          </div>        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedWithdrawal(null);
        }}
        title="Chi tiết yêu cầu rút tiền"
        size="lg"
      >
        <div className="space-y-6">
          {selectedWithdrawal && (
            <>
              {/* Doctor Information */}              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin bác sĩ</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Họ tên:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Số điện thoại:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Chuyên khoa:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorSpecialty || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Withdrawal Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin rút tiền</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Số tiền:</span>
                    <p className="font-medium text-blue-600 text-lg">
                      {formatCurrency(selectedWithdrawal.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedWithdrawal.status)}>
                        {getStatusText(selectedWithdrawal.status)}
                      </Badge>
                    </div>
                  </div>                  <div>
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
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin ngân hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Tên ngân hàng:</span>
                    <p className="font-medium">{selectedWithdrawal.bankName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Số tài khoản:</span>
                    <p className="font-medium">{selectedWithdrawal.accountNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">Tên chủ tài khoản:</span>
                    <p className="font-medium">{selectedWithdrawal.accountHolderName}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedWithdrawal.adminNote && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Ghi chú của admin</h3>
                  <p className="text-gray-700">{selectedWithdrawal.adminNote}</p>
                </div>
              )}

              {/* Transfer Proof */}
              {selectedWithdrawal.transferProofUrl && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Chứng từ chuyển tiền</h3>
                  <div className="mt-2">
                    {selectedWithdrawal.transferProofUrl.toLowerCase().includes('.pdf') ? (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Chứng từ PDF</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedWithdrawal.transferProofUrl, '_blank')}
                            className="mt-1"
                          >
                            Xem file PDF
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={selectedWithdrawal.transferProofUrl}
                          alt="Chứng từ chuyển tiền"
                          className="max-w-full h-auto rounded-lg shadow-md border"
                          style={{ maxHeight: '400px' }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedWithdrawal.transferProofUrl, '_blank')}
                          className="mt-2"
                        >
                          Xem ảnh full size
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedWithdrawal(null);
              }}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Transfer Proof Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setProofFile(null);
          setSelectedWithdrawal(null);
        }}
        title="Upload chứng từ chuyển tiền"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Upload chứng từ chuyển tiền cho yêu cầu rút tiền của{' '}
              <span className="font-medium">{selectedWithdrawal?.doctorName}</span>{' '}
              với số tiền{' '}
              <span className="font-medium text-blue-600">
                {formatCurrency(selectedWithdrawal?.amount || 0)}
              </span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chứng từ chuyển tiền <span className="text-red-500">*</span>
            </label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Chọn file ảnh hoặc PDF làm chứng từ chuyển tiền
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setProofFile(null);
                setSelectedWithdrawal(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUploadProof}
              disabled={!proofFile}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Upload chứng từ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminWithdrawalManagement;
