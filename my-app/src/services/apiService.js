import AsyncStorage from '@react-native-async-storage/async-storage';

// Update API base URL to handle both development and production
const API_BASE_URL = 'https://stressbackend.shop'; // For Android Emulator
// const API_BASE_URL = 'http://localhost:8080'; // For iOS Simulator
// const API_BASE_URL = 'http://your-production-api.com'; // For Production

// Helper for API calls with authentication 
const callApi = async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method,
      headers,
    };
      if (body && (method === 'POST' || method === 'PUT')) {
      // Only stringify if Content-Type is application/json
      if (headers['Content-Type'] === 'application/json') {
        config.body = JSON.stringify(body);
      } else {
        // For other content types (like form-urlencoded), use body as-is
        config.body = body;
      }
    }
    
    console.log(`Calling API: ${API_BASE_URL}${endpoint}`, config);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Log response for debugging
    console.log(`API Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP Error: ${response.status}`
      }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth endpoints
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
    });
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw new Error('Login failed. Please try again.');
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserProfile = async (token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/myInfo`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Profile response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
};

// Teacher-specific endpoints
export const getTeacherStats = async () => {
  try {
    const response = await callApi('/api/classes/stats');
    return response;
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    throw error;
  }
};

export const getTeacherClasses = async () => {
  try {
    const response = await callApi('/api/classes/teacher');
    return response;
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    throw error;
  }
};

export const getClassDetails = async (classId) => {
  try {
    const response = await callApi(`/api/classes/${classId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching class ${classId} details:`, error);
    throw error;
  }
};

export const createClass = async (name, description) => {
  try {
    const params = new URLSearchParams();
    params.append('className', name);
    if (description) params.append('description', description);
    
    const response = await callApi('/api/classes', 'POST', params.toString(), {
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return response;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

export const updateClass = async (classId, name, description) => {
  try {
    const params = new URLSearchParams();
    params.append('className', name);
    if (description) params.append('description', description);
    
    const response = await callApi(`/api/classes/${classId}`, 'PUT', params.toString(), {
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return response;
  } catch (error) {
    console.error(`Error updating class ${classId}:`, error);
    throw error;
  }
};

export const deleteClass = async (classId) => {
  try {
    const response = await callApi(`/api/classes/${classId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error(`Error deleting class ${classId}:`, error);
    throw error;
  }
};

export const getClassStressData = async (classId) => {
  try {
    const response = await callApi(`/api/classes/${classId}/stress-data`);
    return response;
  } catch (error) {
    console.error(`Error fetching stress data for class ${classId}:`, error);
    throw error;
  }
};

export const getAllStudentsStressData = async () => {
  try {
    const response = await callApi('/api/classes/all-students-stress');
    return response;
  } catch (error) {
    console.error('Error fetching all students stress data:', error);
    throw error;
  }
};

export const addStudentToClass = async (classId, studentUsername) => {
  try {
    const params = new URLSearchParams();
    params.append('studentUsername', studentUsername);
    
    const response = await callApi(`/api/classes/${classId}/students`, 'POST', params.toString(), {
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return response;
  } catch (error) {
    console.error(`Error adding student to class ${classId}:`, error);
    throw error;
  }
};

export const removeStudentFromClass = async (classId, studentId) => {
  try {
    const response = await callApi(`/api/classes/${classId}/students/${studentId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error(`Error removing student ${studentId} from class ${classId}:`, error);
    throw error;
  }
};

export const getStudentDetails = async (studentId) => {
  try {
    const response = await callApi(`/api/users/${studentId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching student ${studentId} details:`, error);
    throw error;
  }
};

export const getStudentStressData = async (studentId) => {
  try {
    const response = await callApi(`/api/stress/user/${studentId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching stress data for student ${studentId}:`, error);
    throw error;
  }
};

export const getStudentAnswers = async (studentId, fromDate, toDate) => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await callApi(`/api/classes/students/${studentId}/answers${queryString}`);
    return response;
  } catch (error) {
    console.error(`Error fetching answers for student ${studentId}:`, error);
    throw error;
  }
};