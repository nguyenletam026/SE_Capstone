import api from '../utils/api';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data.result;
  } catch (error) {
    console.error('Không thể lấy danh sách người dùng:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.result;
  } catch (error) {
    console.error(`Không thể lấy thông tin người dùng ${userId}:`, error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data.result;
  } catch (error) {
    console.error('Không thể cập nhật thông tin người dùng:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/users/change-password', passwordData);
    return response.data.result;
  } catch (error) {
    console.error('Không thể thay đổi mật khẩu:', error);
    throw error;
  }
};