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

  export const getDoctorsForToday = async () => {
    const token = getToken();
    
    // Thay đổi để test với ngày cụ thể (ví dụ: 2025-05-18)
    // const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const today = "2025-05-18"; // Sử dụng ngày đã được lên lịch trong DB
    
    console.log("Fetching doctors for date:", today);
    
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/doctor-schedules/date/${today}/doctors`;
      console.log("API URL:", apiUrl);
      
      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("API response status:", res.status, res.statusText);
      
      if (!res.ok) {
        console.error("API error:", res.status, res.statusText);
        // Return empty array instead of falling back
        return { result: [] };
      }
      
      const data = await res.json();
      console.log("API response data:", JSON.stringify(data));
      console.log("Doctors for today:", data.result ? data.result.length : 0, "doctors found");
      
      if (data.result && data.result.length > 0) {
        console.log("Doctor IDs:", data.result.map(doc => doc.id).join(", "));
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching doctors for today:", error);
      // Return empty array instead of falling back
      return { result: [] };
    }
  };

  export const getDoctorsByDateTime = async (date, time) => {
    const token = getToken();
    
    // Format: YYYY-MM-DD
    const formattedDate = date || "2025-05-18"; // Default to test date if none provided
    
    // Format: HH:MM:SS
    const formattedTime = time || new Date().toTimeString().split(' ')[0]; // Default to current time if none provided
    
    console.log(`Fetching doctors for date: ${formattedDate} and time: ${formattedTime}`);
    
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/doctor-schedules/date/${formattedDate}/time/${formattedTime}/doctors`;
      console.log("API URL:", apiUrl);
      
      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("API response status:", res.status, res.statusText);
      
      if (!res.ok) {
        console.error("API error:", res.status, res.statusText);
        return { result: [] };
      }
      
      const data = await res.json();
      console.log("API response data:", JSON.stringify(data));
      console.log("Doctors for date/time:", data.result ? data.result.length : 0, "doctors found");
      
      if (data.result && data.result.length > 0) {
        console.log("Doctor IDs:", data.result.map(doc => doc.id).join(", "));
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching doctors for date ${formattedDate} and time ${formattedTime}:`, error);
      return { result: [] };
    }
  };