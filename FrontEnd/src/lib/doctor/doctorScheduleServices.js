import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

// Lấy thông tin bác sĩ hiện tại
export const fetchDoctorInfo = async () => {
  const token = getToken();
  
  try {
    console.log("Fetching doctor info from API");
    
    const res = await fetch(`${API_BASE}/api/users/myInfo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error fetching doctor info:", {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      
      return null;
    }
    
    const data = await res.json();
    console.log("Doctor info from API:", data);
    return data.result;
  } catch (error) {
    console.error("Error fetching doctor info:", error);
    return null;
  }
};

// Lấy lịch làm việc của bác sĩ
export const getDoctorSchedules = async (doctorId) => {
  const token = getToken();
  
  try {
    console.log("Fetching schedules with doctorId:", doctorId);
    
    // If no doctorId provided, get all schedules
    const endpoint = doctorId 
      ? `${API_BASE}/api/doctor-schedules`
      : `${API_BASE}/api/doctor-schedules`;
    
    console.log("Using endpoint:", endpoint);
    
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      
      return { result: [] };
    }
    
    const data = await res.json();
    console.log("API response data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return { result: [] };
  }
};

// Tạo lịch làm việc mới
export const createDoctorSchedule = async (scheduleData) => {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/api/doctor-schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error("Failed to create doctor schedule");
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error creating schedule:", error);
    throw error;
  }
};

// Cập nhật lịch làm việc
export const updateDoctorSchedule = async (scheduleId, scheduleData) => {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/api/doctor-schedules/${scheduleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error("Failed to update doctor schedule");
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error;
  }
};

// Xóa lịch làm việc
export const deleteDoctorSchedule = async (scheduleId) => {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/api/doctor-schedules/${scheduleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error("Failed to delete doctor schedule");
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
}; 