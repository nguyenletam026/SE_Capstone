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
      // Don't show alert, the payment button is already visible
      return;
    }

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      // Debug the selected user object to understand its structure
      console.log("Selected user in handleSend:", selectedUser);
      console.log("Current user:", user);
      
      // Determine the correct recipient ID based on the selected user structure
      let receiverId;
      
      // For doctors: selectedUser contains patientId
      // For patients: selectedUser contains doctorId
      if (selectedUser.doctorId) {
        // Patient is sending to doctor
        receiverId = selectedUser.doctorId;
        console.log("Patient sending to doctor:", receiverId);
      } else if (selectedUser.patientId) {
        // Doctor is sending to patient
        receiverId = selectedUser.patientId;
        console.log("Doctor sending to patient:", receiverId);
      } else {
        // Try to find the ID in other properties
        const possibleKeys = Object.keys(selectedUser);
        console.log("Available keys in selectedUser:", possibleKeys);
        
        if (possibleKeys.includes('requestId')) {
          // This might be a chat request object
          console.log("Using requestId as fallback");
          receiverId = selectedUser.requestId;
        } else {
          console.error("Cannot determine recipient - selectedUser:", selectedUser);
          throw new Error("Không thể xác định người nhận tin nhắn");
        }
      }
      
      if (!receiverId) {
        throw new Error("ID người nhận không hợp lệ");
      }
      
      console.log("Sending message from", user.id, "to", receiverId);
      
      const response = await sendMessage(content, user.id, receiverId);
      console.log("Message send response:", response);
      
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
      
      // If payment is required, mark the chat as expired
      if (errorMessage.includes("Vui lòng thanh toán") || 
          errorMessage.includes("Payment required") ||
          errorMessage.includes("hết hạn")) {
        // Update the first message to show it's expired
        if (messages && messages.length > 0) {
          const updatedMessages = [...messages];
          updatedMessages[0] = { ...updatedMessages[0], expired: true };
          setMessages(updatedMessages);
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
      // Don't show alert, the payment button is already visible
      return;
    }

    setSending(true);
    try {
      // Debug the selected user object to understand its structure
      console.log("Selected user in handleImageUpload:", selectedUser);
      
      // Determine the correct recipient ID based on the selected user structure
      let receiverId;
      
      // For doctors: selectedUser contains patientId
      // For patients: selectedUser contains doctorId
      if (selectedUser.doctorId) {
        // Patient is sending to doctor
        receiverId = selectedUser.doctorId;
        console.log("Patient sending image to doctor:", receiverId);
      } else if (selectedUser.patientId) {
        // Doctor is sending to patient
        receiverId = selectedUser.patientId;
        console.log("Doctor sending image to patient:", receiverId);
      } else {
        // Try to find the ID in other properties
        const possibleKeys = Object.keys(selectedUser);
        console.log("Available keys in selectedUser:", possibleKeys);
        
        if (possibleKeys.includes('requestId')) {
          // This might be a chat request object
          console.log("Using requestId as fallback");
          receiverId = selectedUser.requestId;
        } else {
          console.error("Cannot determine recipient - selectedUser:", selectedUser);
          throw new Error("Không thể xác định người nhận tin nhắn");
        }
      }
      
      if (!receiverId) {
        throw new Error("ID người nhận không hợp lệ");
      }
      
      console.log("Sending image from", user.id, "to", receiverId);
      
      const formData = new FormData();
      formData.append("image", file);
      formData.append("content", "");
      
      await sendMessageWithImage(formData, user.id, receiverId);
      // Message will be received through WebSocket
    } catch (err) {
      console.error("Failed to send image:", err);
      if (err.message.includes("expired")) {
        // Update the first message to show it's expired
        if (messages && messages.length > 0) {
          const updatedMessages = [...messages];
          updatedMessages[0] = { ...updatedMessages[0], expired: true };
          setMessages(updatedMessages);
        }
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
        {messages && messages.filter(msg => msg && msg.senderId).map((msg, index) => {
          // Generate a unique key for each message
          const messageKey = msg.id ? 
            `msg-${msg.id}` : 
            (msg.timestamp ? 
              `time-${msg.timestamp}-${index}` : 
              `idx-${index}-${msg.content?.substring(0, 10)}`);
            
          return (
            <div
              key={messageKey}
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
          );
        })}
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
          <div className="mt-4 flex flex-col items-center bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-600 font-medium mb-3 text-center">
              Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục trò chuyện.
            </p>
            <button
              onClick={() => {
                // Make sure we have a doctorId before navigating
                const doctorId = selectedUser.doctorId;
                if (doctorId) {
                  navigate(`/contact-doctor/${doctorId}`, { state: { expired: true } });
                } else {
                  alert("Không thể xác định bác sĩ. Vui lòng thử lại sau.");
                }
              }}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium shadow-md"
            >
              <span>Thanh toán ngay</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
