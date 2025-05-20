import { getToken } from "../../services/localStorageService";

export const requestChatWithDoctor = async (doctorId) => {
  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }
  
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat-requests/${doctorId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Chat request failed:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || "Không thể gửi yêu cầu tư vấn");
    }
    
    // Request is now auto-approved, so we can immediately return the result
    return res.json();
  } catch (error) {
    console.error('Chat request error:', error);
    throw error;
  }
};

export const getConversation = async (user1Id, user2Id) => {
  if (!user1Id || !user2Id) {
    throw new Error("Both user IDs are required");
  }
  
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  
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
    
    const data = await res.json();
    // Ensure we always return an array, even if the API returns null or undefined
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Conversation fetch error:', error);
    throw error;
  }
};

export const createChatPayment = async (doctorId, hours) => {
  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }
  
  if (!hours || isNaN(hours) || hours <= 0) {
    throw new Error("Valid number of hours is required");
  }
  
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  
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

export const getUnreadMessageCount = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/chat/unread/count?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Failed to fetch unread message count:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || "Failed to fetch unread messages count");
    }
    
    const count = await res.json();
    return { result: count };
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return { result: 0 }; // Return 0 if there's an error
  }
};

export const sendMessage = async (content, senderId, receiverId) => {
  if (!content) {
    throw new Error("Message content is required");
  }
  
  if (!senderId) {
    throw new Error("Sender ID is required");
  }
  
  if (!receiverId) {
    throw new Error("Receiver ID is required");
  }
  
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  
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
  if (!formData) {
    throw new Error("Form data is required");
  }
  
  if (!senderId) {
    throw new Error("Sender ID is required");
  }
  
  if (!receiverId) {
    throw new Error("Receiver ID is required");
  }
  
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  
  formData.append("senderId", senderId);
  formData.append("receiverId", receiverId);

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/send-with-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = "Không thể gửi tin nhắn với ảnh";
      
      try {
        // Try to parse as JSON if possible
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If not JSON, use the text directly
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error) {
    console.error('Image message send error:', error);
    throw error;
  }
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

export const markMessagesAsRead = async (userId, senderId) => {
  if (!userId || !senderId) {
    throw new Error("Both user IDs are required");
  }
  
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }
  
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/chat/read?userId=${userId}&senderId=${senderId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Mark messages as read failed:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(errorData.message || "Failed to mark messages as read");
    }
    
    return res.json();
  } catch (error) {
    console.error('Mark messages as read error:', error);
    throw error;
  }
};