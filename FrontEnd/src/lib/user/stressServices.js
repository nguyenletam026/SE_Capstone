// 📁 services/stressServices.js
import { getToken } from "../../services/localStorageService";

const BASE_URL = process.env.REACT_APP_API_URL;

export const getDailyStress = async () => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/stress/daily`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export const getMonthlyStress = async () => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/stress/monthly`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export const analyzeImage = async (formData) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/stress/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Unauthorized or failed");
  return res.json();
};

// ✅ NEW: Today stress data
export const getTodayStress = async () => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/stress/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

// ✅ NEW: Weekly stress data
export const getWeeklyStress = async () => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/stress/weekly`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};
