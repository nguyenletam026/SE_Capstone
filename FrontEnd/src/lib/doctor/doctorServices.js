import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

// Lấy tất cả yêu cầu trò chuyện đang chờ
export const getPendingChatRequests = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/chat-requests/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch pending requests");
  return res.json();
};

// Chấp nhận yêu cầu trò chuyện
export const acceptChatRequest = async (requestId) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/chat-requests/${requestId}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to accept chat request");
  return res.json();
};

// Từ chối yêu cầu trò chuyện
export const rejectChatRequest = async (requestId) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/chat-requests/${requestId}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to reject chat request");
  return res.json();
};

// Lấy danh sách bệnh nhân đã được chấp nhận
export const getAcceptedChatPatients = async () => {
  const token = getToken();
  console.log("Token:", token); // Debug token
  console.log("API URL:", `${API_BASE}/api/chat-requests/accepted`); // Debug API URL
  
  try {
    const res = await fetch(`${API_BASE}/api/chat-requests/accepted`, {
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
      throw new Error("Failed to fetch accepted chat patients");
    }
    
    const data = await res.json();
    console.log("API Response:", data); // Debug response
    return data;
  } catch (error) {
    console.error("Error details:", error);
    throw error;
  }
};

// Lấy danh sách bệnh nhân đã thanh toán phí tư vấn
export const getPaidChatPatients = async () => {
  const token = getToken();
  
  try {
    const res = await fetch(`${API_BASE}/api/chat-payments/paid-chats`, {
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
      throw new Error("Failed to fetch paid chat patients");
    }
    
    const data = await res.json();
    console.log("Paid chats API Response:", data); 
    return data;
  } catch (error) {
    console.error("Error getting paid chats:", error);
    throw error;
  }
};

export const getAcceptedChatDoctor = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/chat-requests/user/accepted`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch accepted chat patients");
  return res.json();
};

// Lấy tổng quan tất cả các request của người dùng gửi
export const getAllChatRequestsOverview = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/chat-requests/my-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch all chat request overview");
  return res.json();
};