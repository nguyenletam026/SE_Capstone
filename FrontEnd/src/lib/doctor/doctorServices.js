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
  const res = await fetch(`${API_BASE}/api/chat-requests/accepted`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch accepted chat patients");
  return res.json();
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