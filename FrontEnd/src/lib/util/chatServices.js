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
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/chat/conversation?user1Id=${user1Id}&user2Id=${user2Id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Conversation fetch failed:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || "Failed to fetch conversation");
    }
    
    return res.json();
  } catch (error) {
    console.error('Conversation fetch error:', error);
    throw error;
  }
};

export const createChatPayment = async (doctorId, hours) => {
  const token = getToken();
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat-payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctorId,
        hours,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Payment creation failed:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      
      // Throw error with specific message from backend
      throw new Error(errorData.message || "Không thể tạo thanh toán");
    }
    return res.json();
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error;
  }
};

export const getChatPaymentByRequestId = async (requestId) => {
  const token = getToken();
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/chat-payments/request/${requestId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Không thể lấy thông tin thanh toán");
  return res.json();
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

export const sendMessage = async (content, senderId, receiverId) => {
  const token = getToken();
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        senderId,
        receiverId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Message send failed:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || "Không thể gửi tin nhắn");
    }
    return res.json();
  } catch (error) {
    console.error('Message send error:', error);
    throw error;
  }
};

export const sendMessageWithImage = async (formData, senderId, receiverId) => {
  const token = getToken();
  formData.append("senderId", senderId);
  formData.append("receiverId", receiverId);

  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/send-with-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Không thể gửi tin nhắn với ảnh");
  return res.json();
};

export const getActiveChatDoctors = async () => {
  const token = getToken();
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat-payments/active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Failed to fetch active chat doctors:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || "Không thể lấy danh sách bác sĩ có thể chat");
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching active chat doctors:', error);
    throw error;
  }
};