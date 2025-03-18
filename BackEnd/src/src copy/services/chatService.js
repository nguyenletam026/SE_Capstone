import api from '../utils/api';
import { sendMessage as sendWebSocketMessage } from '../utils/websocket';

export const getConversation = async (user1Id, user2Id) => {
  try {
    const response = await api.get('/api/chat/conversation', {
      params: { user1Id, user2Id }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể lấy tin nhắn:', error);
    throw error;
  }
};

export const sendMessage = (message) => {
  // Gửi qua WebSocket
  const sent = sendWebSocketMessage(message);
  
  // Nếu WebSocket không hoạt động, gửi qua REST API
  if (!sent) {
    return sendMessageREST(message);
  }
  
  return Promise.resolve();
};

export const sendMessageREST = async (message) => {
  try {
    const response = await api.post('/api/chat/message', {
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId
    });
    return response.data;
  } catch (error) {
    console.error('Không thể gửi tin nhắn:', error);
    throw error;
  }
};

export const sendMessageWithImage = async (content, senderId, receiverId, image) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    formData.append('image', image);

    const response = await api.post('/api/chat/message-with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Không thể gửi tin nhắn có hình:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (userId, senderId) => {
  try {
    const response = await api.post('/api/chat/read', null, {
      params: { userId, senderId }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể đánh dấu đã đọc:', error);
    throw error;
  }
};

export const getUnreadMessages = async (userId) => {
  try {
    const response = await api.get('/api/chat/unread', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể lấy tin nhắn chưa đọc:', error);
    throw error;
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const response = await api.get('/api/chat/unread/count', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể lấy số lượng tin nhắn chưa đọc:', error);
    throw error;
  }
};

export const getRecentMessages = async (userId) => {
  try {
    const response = await api.get('/api/chat/recent', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Không thể lấy tin nhắn gần đây:', error);
    throw error;
  }
};