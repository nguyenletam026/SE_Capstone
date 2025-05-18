import axios from "axios";
import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const fetchUserInfo = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/users/myInfo`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  return await response.json();
};

export const requestDoctor = async (formData, certificateUrl, cccdUrl) => {
  const token = getToken();
  
  const queryParams = new URLSearchParams({
    specialization: formData.specialization,
    experienceYears: formData.experienceYears,
    description: formData.description,
    phoneNumber: formData.phoneNumber,
    hospital: formData.hospital,
  }).toString();

  const body = {
    certificateImage: certificateUrl,
    cccdImage: cccdUrl,
  };

  return axios.post(`${API_BASE}/api/doctors/request-doctor?${queryParams}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
};

export const fetchUserInfo2 = async () => {
  const token = getToken();
  try {
    const response = await axios.get(`${API_BASE}/api/users/myInfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.result;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  const token = getToken();
  try {
    const response = await axios.put(
      `${API_BASE}/api/users/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const updateUserAvatar = async (userId, avatarFile) => {
  const token = getToken();
  try {
    const formData = new FormData();
    formData.append("avtFile", avatarFile);
    
    const response = await axios.put(
      `${API_BASE}/api/users/${userId}/avatar`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
};
