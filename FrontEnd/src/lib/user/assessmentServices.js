import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

export const getQuestions = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/questions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
};

export const submitAnswer = async (questionId, selectedOptionIndex) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/questions/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ questionId, selectedOptionIndex }),
  });

  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
};

export const getUserAnswers = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/questions/my-answers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to get result");
  return res.json();
};
export const getMyAnswers = async () => {
    const token = getToken();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/questions/my-answers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (!res.ok) throw new Error("Failed to fetch user answers");
    return res.json();
  };

  export const getMyRecommendation = async () => {
    const token = getToken();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-my-recommend`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch recommendation");
    return res.json();
  };
  
  export const getAllDoctorRecommend = async () => {
    const token = getToken();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/get-all-doctor-recommend`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch doctor list");
    return res.json();
  };