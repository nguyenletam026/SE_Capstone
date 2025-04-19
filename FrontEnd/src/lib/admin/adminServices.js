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
    const response = await fetch(`${API_URL}/doctors/approved-doctors`, {
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
