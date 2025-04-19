import { getToken } from "../../services/localStorageService";

export const requestChatWithDoctor = async (doctorId) => {
  const token = getToken();
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat-requests/${doctorId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Không thể gửi yêu cầu tư vấn");
  return res.json();
};

export const getConversation = async (user1Id, user2Id) => {
    const token = getToken();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/conversation?user1Id=${user1Id}&user2Id=${user2Id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load conversation");
    
    // Get the response data
    const data = await res.json();
    
    // The API returns array directly, wrap it in an object with result property to match expected format
    return {
      result: data
    };
  };

export const getUnreadMessages = async (userId) => {
    const token = getToken();
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/unread?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch unread messages");
    
    // Get the response data
    const data = await res.json();
    
    // The API returns array directly, wrap it in an object with result property to match expected format
    return {
      result: data
    };
  };