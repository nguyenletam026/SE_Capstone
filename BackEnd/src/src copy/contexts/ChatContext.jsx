import React, { createContext, useState, useContext, useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket, isConnected, reconnect } from '../utils/websocket';
import { getConversation, markMessagesAsRead } from '../services/chatService';
import { useAuth } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (currentUser) {
      // Kết nối WebSocket khi đã đăng nhập
      connectWebSocket(
        currentUser.username,
        () => console.log('WebSocket connected'),
        handleMessageReceived,
        (error) => console.error('WebSocket error:', error)
      );
      
      // Kiểm tra và tự động kết nối lại WebSocket nếu mất kết nối
      const reconnectInterval = setInterval(() => {
        if (currentUser && !isConnected()) {
          reconnect();
        }
      }, 5000);
      
      return () => {
        disconnectWebSocket();
        clearInterval(reconnectInterval);
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && selectedUser) {
      loadConversation();
    }
  }, [currentUser, selectedUser]);

  const handleMessageReceived = (message) => {
    const receivedMessage = JSON.parse(message.body);
    
    // Nếu tin nhắn từ người đang chat, tự động đánh dấu đã đọc
    if (selectedUser && receivedMessage.senderId === selectedUser.id) {
      markMessagesAsRead(currentUser.id, receivedMessage.senderId);
      receivedMessage.read = true;
    } else {
      // Cập nhật số lượng tin nhắn chưa đọc
      setUnreadCounts(prev => ({
        ...prev,
        [receivedMessage.senderId]: (prev[receivedMessage.senderId] || 0) + 1
      }));
    }
    
    setMessages(prev => [...prev, receivedMessage]);
  };

  const loadConversation = async () => {
    if (!currentUser || !selectedUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getConversation(currentUser.id, selectedUser.id);
      setMessages(data);
      
      // Đánh dấu tin nhắn đã đọc khi mở cuộc trò chuyện
      await markMessagesAsRead(currentUser.id, selectedUser.id);
      
      // Xóa số đếm tin nhắn chưa đọc
      setUnreadCounts(prev => ({ ...prev, [selectedUser.id]: 0 }));
    } catch (err) {
      setError('Không thể tải tin nhắn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    selectedUser,
    setSelectedUser,
    messages,
    setMessages,
    loading,
    error,
    unreadCounts,
    setUnreadCounts,
    loadConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);