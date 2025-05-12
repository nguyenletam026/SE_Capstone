import React, { useState, useEffect, useRef } from "react";
import ChatHeader from "./chatHeader"; // bạn tự tạo component này nếu cần
import MessageList from "./messageList"; // bạn tự tạo component này nếu cần
import ChatInput from "./chatInput"; // bạn tự tạo component này nếu cần
import { useChat } from "../../context/ChatContext";
import { sendMessage, sendMessageWithImage } from "../../lib/util/chatServices";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ChatContainer = () => {
  const { user } = useAuth();
  const { selectedUser, messages, setMessages, loading } = useChat();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages && messages.length > 0 && messages[0] && messages[0].expiresAt) {
      const updateTimeLeft = () => {
        const now = new Date();
        const expiry = new Date(messages[0].expiresAt);
        const diff = expiry - now;
        
        if (diff <= 0) {
          setTimeLeft("Hết hạn");
          return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      };
      
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000); // Update every minute
      
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedUser || !user?.id) return;
    
    // Check if chat is expired
    if (messages && messages.length > 0 && messages[0] && messages[0].expired) {
      alert("Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục trò chuyện.");
      return;
    }

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      const receiverId = selectedUser.doctorId || selectedUser.patientId;
      const response = await sendMessage(content, user.id, receiverId);
      
      // Add message to state immediately after successful send
      if (response) {
        const newMessage = {
          id: response.id,
          content: content,
          senderId: user.id,
          senderName: user.username,
          receiverId: receiverId,
          timestamp: new Date().toISOString(),
          read: false
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMessage = err.message;
      
      // If payment is required, redirect to payment page
      if (errorMessage.includes("Vui lòng thanh toán")) {
        const doctorId = selectedUser.doctorId;
        if (window.confirm(errorMessage + "\n\nBạn có muốn chuyển đến trang thanh toán không?")) {
          navigate(`/contact-doctor/${doctorId}`);
          return;
        }
      } else {
        alert(errorMessage || "Không thể gửi tin nhắn. Vui lòng thử lại sau.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser || !user?.id) return;
    
    // Check if chat is expired
    if (messages && messages.length > 0 && messages[0] && messages[0].expired) {
      alert("Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục trò chuyện.");
      return;
    }

    setSending(true);
    try {
      const receiverId = selectedUser.doctorId || selectedUser.patientId;
      const formData = new FormData();
      formData.append("image", file);
      formData.append("content", "");
      
      await sendMessageWithImage(formData, user.id, receiverId);
      // Message will be received through WebSocket
    } catch (err) {
      console.error("Failed to send image:", err);
      if (err.message.includes("expired")) {
        alert("Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục trò chuyện.");
      } else {
        alert("Không thể gửi ảnh. Vui lòng thử lại sau.");
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Chọn một người dùng để bắt đầu trò chuyện
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      
      {/* Time Left Display */}
      {timeLeft && (
        <div className={`px-4 py-2 text-sm font-medium text-center ${
          timeLeft === "Hết hạn" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          Thời gian còn lại: {timeLeft}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.filter(msg => msg && msg.senderId).map((msg) => (
          <div
            key={msg.id || msg.timestamp}
            className={`flex ${
              msg.senderId === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.senderId === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Sent"
                  className="max-w-full rounded-lg mb-2"
                />
              )}
              <p>{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
            disabled={sending || (messages && messages.length > 0 && messages[0] && messages[0].expired)}
          />
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={sending || (messages && messages.length > 0 && messages[0] && messages[0].expired)}
            />
            <span className="text-2xl">📷</span>
          </label>
          
          <button
            onClick={handleSend}
            disabled={sending || !input.trim() || (messages && messages.length > 0 && messages[0] && messages[0].expired)}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:opacity-50"
          >
            {sending ? "..." : "➤"}
          </button>
        </div>
        
        {messages && messages.length > 0 && messages[0] && messages[0].expired && (
          <p className="text-red-500 text-sm mt-2 text-center">
            Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục trò chuyện.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
