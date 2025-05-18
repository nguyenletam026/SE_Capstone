import { getToken } from "../../services/localStorageService";

const API_URL = process.env.REACT_APP_API_URL;

export const getRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch roles");
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(roleData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const updateRole = async (roleName, updatedData) => {
  try {
    const response = await fetch(`${API_URL}/roles/${roleName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(updatedData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

export const deleteRole = async (roleName) => {
  try {
    const response = await fetch(`${API_URL}/roles/${roleName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

export const getDoctorRequests = async () => {
  try {
    const response = await fetch(`${API_URL}/doctors/doctor-requests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.code === 1000 && Array.isArray(data.result)) {
      return data.result;
    } else {
      return []; // fallback nếu API lỗi
    }
  } catch (error) {
    console.error("Error fetching doctor requests:", error);
    return [];
  }
};

export const approveDoctor = async (requestId) => {
  try {
    const response = await fetch(`${API_URL}/doctors/approve-doctor/${requestId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error approving doctor:", error);
    throw error;
  }
};

export const rejectDoctor = async (requestId) => {
  try {
    const response = await fetch(`${API_URL}/doctors/reject-doctor/${requestId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    throw error;
  }
};

export const getApprovedDoctors = async () => {
  try {
    const response = await fetch(`${API_URL}/api/users/doctors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.code === 1000 && Array.isArray(data.result)) {
      return data.result;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching approved doctors:", error);
    return [];
  }
};

// Doctor scheduling functions

export const getDoctorSchedules = async () => {
  try {
    const response = await fetch(`${API_URL}/api/doctor-schedules`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.code === 1000 && Array.isArray(data.result)) {
      return data.result;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
    return [];
  }
};

export const createDoctorSchedule = async (scheduleData) => {
  try {
    const response = await fetch(`${API_URL}/api/doctor-schedules`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error creating doctor schedule:", error);
    throw error;
  }
};

export const updateDoctorSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await fetch(`${API_URL}/api/doctor-schedules/${scheduleId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error updating doctor schedule:", error);
    throw error;
  }
};

export const deleteDoctorSchedule = async (scheduleId) => {
  try {
    const response = await fetch(`${API_URL}/api/doctor-schedules/${scheduleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting doctor schedule:", error);
    throw error;
  }
};

export const getDoctorScheduleById = async (doctorId) => {
  try {
    const response = await fetch(`${API_URL}/api/doctor-schedules/doctor/${doctorId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.code === 1000 && Array.isArray(data.result)) {
      return data.result;
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching schedules for doctor ${doctorId}:`, error);
    return [];
  }
};

export const getDoctorsByDate = async (date) => {
  try {
    const formattedDate = date ? date : new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const response = await fetch(`${API_URL}/api/doctor-schedules/date/${formattedDate}/doctors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.code === 1000 && Array.isArray(data.result)) {
      return data.result;
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching doctors for date ${date}:`, error);
    return [];
  }
};

export const checkPendingDoctorRequest = async () => {
  try {
    const response = await fetch(`${API_URL}/doctors/check-pending-request`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.code === 1000) {
      return data.result;
    }
    return false;
  } catch (error) {
    console.error("Error checking pending doctor request:", error);
    return false;
  }
};
