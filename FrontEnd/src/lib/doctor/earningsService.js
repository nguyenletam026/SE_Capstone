import api from '../apiService';

// Doctor Earnings API Services

// Get doctor's earnings history
export const getDoctorEarnings = async () => {
  try {
    console.log('🔄 Making API call to /api/doctor/earnings/history');
    const response = await api.get('/api/doctor/earnings/history');
    console.log('✅ Successfully received earnings history:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching doctor earnings:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers
    });
    throw error;
  }
};

// Get doctor's confirmed earnings
export const getDoctorConfirmedEarnings = async () => {
  try {
    console.log('🔄 Making API call to /api/doctor/earnings/confirmed');
    const response = await api.get('/api/doctor/earnings/confirmed');
    console.log('✅ Successfully received confirmed earnings:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching confirmed earnings:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers
    });
    throw error;
  }
};

// Get doctor's earnings statistics
export const getDoctorEarningsStats = async () => {
  try {
    console.log('🔄 Making API call to /api/doctor/earnings/stats');
    const response = await api.get('/api/doctor/earnings/stats');
    console.log('✅ Successfully received earnings stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching earnings stats:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
};

// Get doctor's monthly earnings summary
export const getDoctorMonthlySummary = async () => {
  try {
    console.log('🔄 Making API call to /api/doctor/earnings/monthly-summary');
    const response = await api.get('/api/doctor/earnings/monthly-summary');
    console.log('✅ Successfully received monthly summary:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching monthly summary:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
};

// Get doctor's earnings by date range
export const getDoctorEarningsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/api/doctor/earnings/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching earnings by date range:', error);
    throw error;
  }
};

// Withdrawal Requests API Services

// Create withdrawal request
export const createWithdrawalRequest = async (requestData) => {
  try {
    console.log('🔄 Making API call to /api/withdrawal/request');
    console.log('📤 Original request data:', requestData);
    
    // Transform the request data to match backend DTO expectations
    const transformedData = {
      amount: requestData.amount,
      bankName: requestData.bankName,
      accountNumber: requestData.bankAccount, // Map bankAccount to accountNumber
      accountHolderName: requestData.accountHolderName
    };
    
    console.log('📤 Transformed request payload:', transformedData);
    
    const response = await api.post('/api/withdrawal/request', transformedData);
    console.log('✅ Successfully created withdrawal request:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating withdrawal request:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers,
      requestData: error.config?.data
    });
    throw error;
  }
};

// Get doctor's withdrawal requests
export const getDoctorWithdrawalRequests = async () => {
  try {
    const response = await api.get('/api/withdrawal/my-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    throw error;
  }
};

// Get specific withdrawal request (từ danh sách requests)
export const getWithdrawalRequest = async (requestId) => {
  try {
    const response = await api.get('/api/withdrawal/my-requests');
    const requests = response.data;
    const specificRequest = requests.find(req => req.id === requestId);
    return specificRequest;
  } catch (error) {
    console.error('Error fetching withdrawal request:', error);
    throw error;
  }
};

// Cancel withdrawal request
export const cancelWithdrawalRequest = async (requestId) => {
  try {
    const response = await api.post(`/api/withdrawal/cancel/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling withdrawal request:', error);
    throw error;
  }
};

// Get withdrawal statistics for doctor
export const getDoctorWithdrawalStats = async () => {
  try {
    const response = await api.get('/api/withdrawal/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching withdrawal stats:', error);
    throw error;
  }
};

// Admin APIs
export const adminGetAllEarnings = async () => {
  try {
    const response = await api.get('/api/doctor/earnings/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all earnings:', error);
    throw error;
  }
};

export const adminGetEarningsByStatus = async (status) => {
  try {
    const response = await api.get(`/api/doctor/earnings/admin/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching earnings by status:', error);
    throw error;
  }
};

export const adminGetPlatformFees = async () => {
  try {
    const response = await api.get('/api/doctor/earnings/admin/platform-fees');
    return response.data;
  } catch (error) {
    console.error('Error fetching platform fees:', error);
    throw error;
  }
};

export const adminConfirmEarning = async (earningId) => {
  try {
    const response = await api.post(`/api/doctor/earnings/admin/confirm/${earningId}`);
    return response.data;
  } catch (error) {
    console.error('Error confirming earning:', error);
    throw error;
  }
};

export const adminGetAllWithdrawals = async () => {
  try {
    const response = await api.get('/api/withdrawal/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all withdrawals:', error);
    throw error;
  }
};

export const adminGetWithdrawalsByStatus = async (status) => {
  try {
    const response = await api.get(`/api/withdrawal/admin/status/${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching withdrawals by status:', error);
    throw error;
  }
};

export const adminCompleteWithdrawal = async (requestId, transferProofFile) => {
  try {
    const formData = new FormData();
    if (transferProofFile) {
      formData.append('transferProof', transferProofFile);
    }

    const response = await api.post(`/api/withdrawal/admin/approve/${requestId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error completing withdrawal:', error);
    throw error;
  }
};

// Get all withdrawal requests for admin
export const getAllWithdrawals = async () => {
  try {
    const response = await api.get('/api/withdrawal/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all withdrawals:', error);
    throw error;
  }
};

// Get withdrawal statistics for admin
export const getWithdrawalStatistics = async () => {
  try {
    const response = await api.get('/api/withdrawal/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching withdrawal statistics:', error);
    throw error;
  }
};

// Approve withdrawal request
export const approveWithdrawal = async (requestId, data) => {
  try {
    const formData = new FormData();
    if (data.transferProof) {
      formData.append('transferProof', data.transferProof);
    }
    if (data.adminNote) {
      formData.append('adminNote', data.adminNote);
    }

    const response = await api.post(`/api/withdrawal/admin/approve/${requestId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    throw error;
  }
};

// Reject withdrawal request
export const rejectWithdrawal = async (requestId, data) => {
  try {
    const formData = new FormData();
    if (data.adminNote) {
      formData.append('adminNote', data.adminNote);
    }

    const response = await api.post(`/api/withdrawal/admin/reject/${requestId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    throw error;
  }
};

// Upload transfer proof
export const uploadTransferProof = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/withdrawal/admin/upload-proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading transfer proof:', error);
    throw error;
  }
};

// Update transfer proof for existing withdrawal request
export const updateTransferProof = async (requestId, file) => {
  try {
    const formData = new FormData();
    formData.append('transferProof', file);

    const response = await api.post(`/api/withdrawal/admin/update-proof/${requestId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating transfer proof:', error);
    throw error;
  }
};
