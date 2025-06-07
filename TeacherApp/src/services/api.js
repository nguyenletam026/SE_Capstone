import axios from 'axios';
import { getToken, clearAuthData } from './storage';

// API base URL - thay đổi theo môi trường
const API_BASE_URL = 'https://stressbackend.shop'; 

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, logout
      await clearAuthData();
      // Có thể navigate về login screen ở đây
    }
    return Promise.reject(error);
  }
);

// Helper function to extract data from API response
const extractResponseData = (response) => {
  console.log('API Response:', response.data);
  
  // Check if response has the nested structure { code, result }
  if (response.data && response.data.result !== undefined) {
    return response.data.result;
  }
  
  // Otherwise return the data directly
  return response.data;
};

// Teacher API functions
export const teacherAPI = {
  // Đăng nhập
  login: async (username, password) => {
    const response = await api.post('/auth/token', { username, password });
    return extractResponseData(response);
  },

  // Lấy danh sách lớp học của giáo viên
  getClasses: async () => {
    const response = await api.get('/api/classes/teacher');
    return extractResponseData(response);
  },

  // Lấy tổng quan stress của tất cả lớp
  getAllClassesStressOverview: async () => {
    const response = await api.get('/api/classes/stress-overview/all');
    return extractResponseData(response);
  },

  // Lấy tổng quan stress của một lớp cụ thể
  getClassStressOverview: async (classId) => {
    const response = await api.get(`/api/classes/${classId}/stress-overview`);
    return extractResponseData(response);
  },

  // Lấy dữ liệu stress chi tiết của học sinh trong lớp
  getClassStressData: async (classId) => {
    const response = await api.get(`/api/classes/${classId}/stress-data`);
    return extractResponseData(response);
  },

  // Lấy tất cả dữ liệu stress của học sinh
  getAllStudentsStress: async () => {
    const response = await api.get('/api/classes/all-students-stress');
    return extractResponseData(response);
  },  // Lấy thông tin chi tiết học sinh
  getStudentInfo: async (studentId) => {
    console.log(`Calling getStudentInfo API: studentId=${studentId}`);
    const url = `/api/users/${studentId}`;
    console.log(`Full URL: ${API_BASE_URL}${url}`);
    
    const response = await api.get(url);
    console.log('getStudentInfo response:', response.data);
    return extractResponseData(response);
  },

  // Lấy thông tin học sinh với stress data (từ StudentStressDto)
  getStudentStressInfo: async (studentId, classId = null) => {
    console.log(`Calling getStudentStressInfo API: studentId=${studentId}, classId=${classId}`);
    
    try {
      // First try to get from a specific class if classId is provided
      if (classId) {
        const url = `/api/classes/${classId}/stress-data`;
        console.log(`Full URL: ${API_BASE_URL}${url}`);
        
        const response = await api.get(url);
        const stressDataList = extractResponseData(response);
        
        // Find the specific student in the stress data list
        if (Array.isArray(stressDataList)) {
          const studentStressData = stressDataList.find(student => student.studentId === studentId);
          if (studentStressData) {
            console.log('getStudentStressInfo found student in class data:', studentStressData);
            return studentStressData;
          }
        }
      }
      
      // Fallback to all students stress data
      const url = `/api/classes/all-students-stress`;
      console.log(`Full URL: ${API_BASE_URL}${url}`);
      
      const response = await api.get(url);
      const allStressData = extractResponseData(response);
      
      // Find the specific student
      if (Array.isArray(allStressData)) {
        const studentStressData = allStressData.find(student => student.studentId === studentId);
        if (studentStressData) {
          console.log('getStudentStressInfo found student in all data:', studentStressData);
          return studentStressData;
        }
      }
      
      console.log('Student not found in stress data');
      return null;
    } catch (error) {
      console.error('Error getting student stress info:', error);
      return null;
    }
  },

  // Lấy dữ liệu stress của học sinh
  getStudentStress: async (studentId) => {
    console.log(`Calling getStudentStress API: studentId=${studentId}`);
    const url = `/api/stress/user/${studentId}`;
    console.log(`Full URL: ${API_BASE_URL}${url}`);
    
    const response = await api.get(url);
    console.log('getStudentStress response:', response.data);
    return extractResponseData(response);
  },
  // Lấy câu trả lời của học sinh theo khoảng thời gian
  getStudentAnswers: async (studentId, fromDate, toDate) => {
    console.log(`Calling getStudentAnswers API: studentId=${studentId}, fromDate=${fromDate}, toDate=${toDate}`);
    const url = `/api/classes/students/${studentId}/answers?fromDate=${fromDate}&toDate=${toDate}`;
    console.log(`Full URL: ${API_BASE_URL}${url}`);
    
    const response = await api.get(url);
    console.log('getStudentAnswers response:', response.data);
    return extractResponseData(response);
  },
  // Thêm học sinh vào lớp
  addStudentToClass: async (classId, studentUsername) => {
    const formData = new URLSearchParams();
    formData.append('studentUsername', studentUsername);
    
    const response = await api.post(`/api/classes/${classId}/students`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return extractResponseData(response);
  },

  // Xóa học sinh khỏi lớp
  removeStudentFromClass: async (classId, studentId) => {
    const response = await api.delete(`/api/classes/${classId}/students/${studentId}`);
    return extractResponseData(response);
  },
  // Tạo lớp mới
  createClass: async (classData) => {
    const formData = new URLSearchParams();
    formData.append('className', classData.className);
    formData.append('description', classData.description || '');
    
    const response = await api.post('/api/classes', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return extractResponseData(response);
  },
  // Cập nhật thông tin lớp
  updateClass: async (classId, classData) => {
    const formData = new URLSearchParams();
    formData.append('className', classData.className);
    formData.append('description', classData.description || '');
    
    const response = await api.put(`/api/classes/${classId}`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return extractResponseData(response);
  },
};

export default api;
