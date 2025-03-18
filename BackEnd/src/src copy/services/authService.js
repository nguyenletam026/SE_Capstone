import api from '../utils/api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/token', { username, password });
    if (response.data && response.data.result && response.data.result.token) {
      localStorage.setItem('token', response.data.result.token);
      return response.data.result;
    }
    throw new Error('Token không hợp lệ');
  } catch (error) {
    console.error('Đăng nhập thất bại:', error);
    throw error;
  }
};

export const register = async (userData, avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(userData)], { type: 'application/json' }));
    formData.append('avtFile', avatarFile);

    const response = await api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Đăng ký thất bại:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/myInfo');
    return response.data.result;
  } catch (error) {
    console.error('Không thể lấy thông tin người dùng:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const faceAuthentication = async (username, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('file_target', imageFile);

    const response = await api.post('/auth-face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.result && response.data.result.token && response.data.result.authenticated) {
      localStorage.setItem('token', response.data.result.token);
      return response.data.result;
    }
    throw new Error('Xác thực khuôn mặt thất bại');
  } catch (error) {
    console.error('Xác thực khuôn mặt thất bại:', error);
    throw error;
  }
};