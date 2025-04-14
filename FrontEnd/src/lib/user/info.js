import axios from "axios";
import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

export const fetchUserInfo = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/users/myInfo`, {
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

  return axios.post(`${API_BASE}/doctors/request-doctor?${queryParams}`, body);
};
