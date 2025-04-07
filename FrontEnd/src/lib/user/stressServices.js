// services/stressServices.js

// 📁 services/stressService.jsx
import { getToken } from "../../services/localStorageService";

export const getDailyStress = async () => {
  const token = getToken();

  const res = await fetch("http://localhost:8080/api/stress/daily", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export const getMonthlyStress = async () => {
  const token = getToken();

  const res = await fetch("http://localhost:8080/api/stress/monthly", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};


// 📁 services/stressService.jsx
export const analyzeImage = async (formData) => {
  const token = getToken();

  const res = await fetch("http://localhost:8080/api/stress/analyze", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Unauthorized or failed");
  return res.json();
};

