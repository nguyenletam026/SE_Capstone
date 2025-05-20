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

  // Make sure the form data has the required fields
  if (!formData.has("image")) {
    throw new Error("Image file is missing");
  }

  // Get the file to validate it
  const imageFile = formData.get("image");
  
  // Validate file size (limit to 5MB)
  if (imageFile.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5MB");
  }
  
  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(imageFile.type)) {
    throw new Error("Only JPEG, PNG, GIF and WebP images are supported");
  }
  
  // Create a new FormData instance to ensure clean data
  const cleanFormData = new FormData();
  
  // Add the image file with a clean filename and type
  const cleanFileName = `image_${Date.now()}.jpg`;
  
  // Create a clean Blob to ensure proper formatting
  const imageBlob = imageFile.slice(0, imageFile.size, 'image/jpeg');
  const cleanFile = new File([imageBlob], cleanFileName, { type: 'image/jpeg' });
  
  cleanFormData.append("image", cleanFile);
  cleanFormData.append("content", formData.get("content") || "");
  cleanFormData.append("senderId", senderId);
  cleanFormData.append("receiverId", receiverId);

  try {
    const apiUrl = `${process.env.REACT_APP_API_URL}/api/chat/message-with-image`;
    console.log('Sending image to URL:', apiUrl);
    
    // Log file details for debugging
    console.log('Image details:', {
      name: cleanFile.name,
      size: `${(cleanFile.size / 1024).toFixed(2)}KB`,
      type: cleanFile.type
    });
    
    // Log full request details for debugging
    console.log('Form data contents:');
    for (const pair of cleanFormData.entries()) {
      console.log(pair[0], pair[1] instanceof File ? 
        `[File: ${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type}]` : 
        pair[1]);
    }
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: cleanFormData,
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!res.ok) {
      console.error('Image upload failed with status:', res.status, res.statusText);
      
      let responseBody;
      try {
        // Try to get JSON response first
        responseBody = await res.json();
        console.error('Response body:', responseBody);
      } catch (e) {
        // If not JSON, get text
        responseBody = await res.text();
        console.error('Response body:', responseBody);
      }
      
      // Handle specific error codes
      if (res.status === 413) {
        throw new Error("Image size too large for server");
      } else if (res.status === 415) {
        throw new Error("Unsupported image format");
      } else if (res.status === 500) {
        throw new Error("Server error processing image. Try a different image or format.");
      } else if (responseBody && responseBody.message) {
        throw new Error(responseBody.message);
      } else {
        throw new Error("Không thể gửi tin nhắn với ảnh");
      }
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