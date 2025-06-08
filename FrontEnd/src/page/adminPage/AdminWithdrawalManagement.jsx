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
      fetchWithdrawals();      alert('Transfer proof uploaded and linked successfully!');
    } catch (error) {
      console.error('Error uploading transfer proof:', error);
      alert('An error occurred while uploading transfer proof');
    }
  };
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'yellow', text: 'Pending' },
      APPROVED: { color: 'green', text: 'Approved' },
      REJECTED: { color: 'red', text: 'Rejected' },
      COMPLETED: { color: 'blue', text: 'Completed' }
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
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed'
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
    <div className="p-6 space-y-6">      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="text-gray-600">Manage withdrawal requests from doctors</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <Card.Content className="p-6">            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Total Requests</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.pendingWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {statistics.approvedWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Approved</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {statistics.rejectedWithdrawals}
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(statistics.totalWithdrawalAmount)}
            </div>
            <p className="text-sm text-gray-600">Total Amount</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(statistics.pendingAmount)}
            </div>
            <p className="text-sm text-gray-600">Pending Amount</p>
          </Card.Content>
        </Card>
      </div>

      {/* Filters */}
      <Card>        <Card.Content className="p-4">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </Card.Content>
      </Card>

      {/* Withdrawals Table */}      <Card>
        <Card.Header>
          <Card.Title>Withdrawal Requests List</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                            className="bg-green-600 hover:bg-green-700"                          >
                            Approve
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
                            Reject
                          </Button>
                        </>
                      )}                      {(withdrawal.status === 'APPROVED' || withdrawal.status === 'COMPLETED') && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowUploadModal(true);
                          }}                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {withdrawal.transferProofUrl ? 'Re-upload Proof' : 'Upload Proof'}
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
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>          {filteredWithdrawals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No withdrawal requests found
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
        }}        title="Approve Withdrawal Request"
      >
        <div className="space-y-4">          <div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to approve the withdrawal request from{' '}
              <span className="font-medium">{selectedWithdrawal?.doctorName}</span>{' '}
              for the amount{' '}
              <span className="font-medium text-green-600">
                {formatCurrency(selectedWithdrawal?.amount || 0)}
              </span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Proof <span className="text-red-500">*</span>
            </label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select an image or PDF file as transfer proof
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Enter notes for the approval decision..."
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
              Cancel
            </Button>
            <Button
              onClick={handleApproveWithdrawal}
              disabled={!proofFile}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Confirm Approval
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
        }}        title="Reject Withdrawal Request"
      >
        <div className="space-y-4">          <div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to reject the withdrawal request from{' '}
              <span className="font-medium">{selectedWithdrawal?.doctorName}</span>{' '}
              for the amount{' '}
              <span className="font-medium text-red-600">
                {formatCurrency(selectedWithdrawal?.amount || 0)}
              </span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Enter reason for rejecting the withdrawal request..."
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
              Cancel
            </Button>
            <Button
              onClick={handleRejectWithdrawal}
              disabled={!actionNote.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              Confirm Rejection
            </Button>
          </div>        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedWithdrawal(null);
        }}        title="Withdrawal Request Details"
        size="lg"
      >
        <div className="space-y-6">
          {selectedWithdrawal && (
            <>
              {/* Doctor Information */}              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Doctor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Full Name:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone Number:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Specialty:</span>
                    <p className="font-medium">{selectedWithdrawal.doctorSpecialty || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Withdrawal Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Withdrawal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Amount:</span>
                    <p className="font-medium text-blue-600 text-lg">
                      {formatCurrency(selectedWithdrawal.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedWithdrawal.status)}>
                        {getStatusText(selectedWithdrawal.status)}
                      </Badge>
                    </div>
                  </div>                  <div>
                    <span className="text-sm text-gray-600">Request Date:</span>
                    <p className="font-medium">
                      {formatDate(selectedWithdrawal.requestedAt || selectedWithdrawal.createdAt)}
                    </p>
                  </div>
                  {selectedWithdrawal.processedAt && (
                    <div>
                      <span className="text-sm text-gray-600">Processed Date:</span>
                      <p className="font-medium">
                        {formatDate(selectedWithdrawal.processedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Bank Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Bank Name:</span>
                    <p className="font-medium">{selectedWithdrawal.bankName}</p>
                  </div>                  <div>
                    <span className="text-sm text-gray-600">Account Number:</span>
                    <p className="font-medium">{selectedWithdrawal.accountNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">Account Holder Name:</span>
                    <p className="font-medium">{selectedWithdrawal.accountHolderName}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedWithdrawal.adminNote && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Admin Notes</h3>
                  <p className="text-gray-700">{selectedWithdrawal.adminNote}</p>
                </div>
              )}

              {/* Transfer Proof */}
              {selectedWithdrawal.transferProofUrl && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Transfer Proof</h3>
                  <div className="mt-2">
                    {selectedWithdrawal.transferProofUrl.toLowerCase().includes('.pdf') ? (
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">PDF Document</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedWithdrawal.transferProofUrl, '_blank')}
                            className="mt-1"
                          >
                            View PDF File
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={selectedWithdrawal.transferProofUrl}
                          alt="Transfer Proof"
                          className="max-w-full h-auto rounded-lg shadow-md border"
                          style={{ maxHeight: '400px' }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedWithdrawal.transferProofUrl, '_blank')}
                          className="mt-2"
                        >
                          View Full Size Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}            </>
          )}          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedWithdrawal(null);
              }}
            >
              Close
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
        title="Upload Transfer Proof"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Upload transfer proof for withdrawal request from{' '}
              <span className="font-medium">{selectedWithdrawal?.doctorName}</span>{' '}
              for the amount{' '}
              <span className="font-medium text-blue-600">
                {formatCurrency(selectedWithdrawal?.amount || 0)}
              </span>?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Proof <span className="text-red-500">*</span>
            </label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select an image or PDF file as transfer proof
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
              Cancel
            </Button>
            <Button
              onClick={handleUploadProof}
              disabled={!proofFile}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Upload Proof
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminWithdrawalManagement;
