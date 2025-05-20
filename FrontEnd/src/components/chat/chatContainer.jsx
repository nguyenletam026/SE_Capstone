import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { sendMessage, sendMessageWithImage } from "../../lib/util/chatServices";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FiSend, 
  FiPaperclip, 
  FiClock, 
  FiInfo,
  FiArrowRight,
  FiArrowDown,
  FiCheck,
  FiCheckCircle
} from "react-icons/fi";
import { sendMessage as sendWebSocketMessage } from "../../services/websocket";

const ChatContainer = () => {
  const { user } = useAuth();
  const { selectedUser, messages, setMessages, loading } = useChat();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const navigate = useNavigate();

  // Smarter scroll to bottom function that respects user scrolling
  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current && (isNearBottom || force)) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: force ? "auto" : "smooth",
        block: "end" 
      });
      if (force) {
        setUserScrolled(false);
        setNewMessageCount(0);
        setShowScrollButton(false);
      }
    } else if (!isNearBottom && !force) {
      // If user has scrolled up and we're not forcing, show scroll button
      setShowScrollButton(true);
      setNewMessageCount(prev => prev + 1);
    }
  };

  // Handle scroll events to detect if user is near bottom
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Consider "near bottom" if within 100px of the bottom
      const bottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setIsNearBottom(bottom);
      if (bottom) {
        setNewMessageCount(0);
        setShowScrollButton(false);
      } else {
        setUserScrolled(true);
      }
    }
  };

  // Scroll to bottom on initial load and when selectedUser changes
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use a small delay to ensure the DOM has updated
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
    setUserScrolled(false);
    setNewMessageCount(0);
  }, [selectedUser]);

  // Smart scroll when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Auto scroll if the last message is from current user or if user hasn't scrolled up
      const shouldAutoScroll = lastMessage?.senderId === user?.id || !userScrolled;
      
      // Small delay to ensure DOM update
      setTimeout(() => {
        scrollToBottom(shouldAutoScroll);
      }, 100);
    }
  }, [messages, user?.id, userScrolled]);

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
      // Determine the correct recipient ID based on the selected user structure
      let receiverId;
      
      // For doctors: selectedUser contains patientId
      // For patients: selectedUser contains doctorId
      if (selectedUser.doctorId) {
        // Patient is sending to doctor
        receiverId = selectedUser.doctorId;
      } else if (selectedUser.patientId) {
        // Doctor is sending to patient
        receiverId = selectedUser.patientId;
      } else {
        // Try to find the ID in other properties
        const possibleKeys = Object.keys(selectedUser);
        
        if (possibleKeys.includes('requestId')) {
          // This might be a chat request object
          receiverId = selectedUser.requestId;
        } else {
          throw new Error("Không thể xác định người nhận tin nhắn");
        }
      }
      
      if (!receiverId) {
        throw new Error("ID người nhận không hợp lệ");
      }
      
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
      
      // Force scroll to bottom after sending
      setTimeout(() => scrollToBottom(true), 100);
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
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file before attempting upload
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ hỗ trợ file hình ảnh JPEG, PNG, GIF và WebP");
      e.target.value = '';
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước hình ảnh phải nhỏ hơn 5MB");
      e.target.value = '';
      return;
    }
    
    if (!selectedUser || !user?.id) {
      alert("Không thể xác định người nhận");
      e.target.value = '';
      return;
    }
    
    setSending(true);
    
    try {
      // Determine the correct recipient ID based on the selected user structure
      let receiverId;
      
      // For doctors: selectedUser contains patientId
      // For patients: selectedUser contains doctorId
      if (selectedUser.doctorId) {
        // Patient is sending to doctor
        receiverId = selectedUser.doctorId;
      } else if (selectedUser.patientId) {
        // Doctor is sending to patient
        receiverId = selectedUser.patientId;
      } else {
        // Try to find the ID in other properties
        const possibleKeys = Object.keys(selectedUser);
        
        if (possibleKeys.includes('requestId')) {
          // This might be a chat request object
          receiverId = selectedUser.requestId;
        } else {
          throw new Error("Không thể xác định người nhận tin nhắn");
        }
      }
      
      if (!receiverId) {
        throw new Error("ID người nhận không hợp lệ");
      }
      
      console.log("Original image:", file.name, "Size:", (file.size / 1024).toFixed(2) + "KB", "Type:", file.type);
      
      // Compress the image before sending
      const compressedImage = await compressImage(file);
      console.log("Compressed image size:", (compressedImage.size / 1024).toFixed(2) + "KB");
      
      // Create a proper FormData object
      const formData = new FormData();
      formData.append("image", compressedImage);
      formData.append("content", ""); // Empty content for image-only message
      
      // Send message with image and handle response
      const response = await sendMessageWithImage(formData, user.id, receiverId);
      console.log("Image upload successful:", response);
      
      // Manually add the message to the state to show immediately without needing to reload
      if (response && response.id) {
        const newMessage = {
          id: response.id,
          content: response.content || "",
          senderId: user.id,
          senderName: user.username,
          receiverId: receiverId,
          timestamp: new Date().toISOString(),
          read: false,
          imageUrl: response.imageUrl // Add the image URL from the response
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Additionally send a WebSocket message to notify the receiver
        sendWebSocketMessage({
          ...newMessage,
          type: "CHAT_MESSAGE",
        });
        
        // Force scroll to bottom after sending image
        setTimeout(() => scrollToBottom(true), 100);
      }
    } catch (err) {
      console.error("Image message send error:", err);
      
      // Show a more specific error message
      let errorMessage = "Không thể gửi ảnh. Vui lòng thử lại sau.";
      
      if (err.message) {
        if (err.message.includes("size")) {
          errorMessage = "Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.";
        } else if (err.message.includes("format") || err.message.includes("supported")) {
          errorMessage = "Định dạng ảnh không được hỗ trợ. Vui lòng sử dụng ảnh JPEG, PNG, GIF hoặc WebP.";
        } else if (err.message.includes("server error") || err.message.includes("500")) {
          errorMessage = "Lỗi máy chủ khi xử lý ảnh. Vui lòng thử lại với ảnh khác hoặc báo cho quản trị viên.";
        } else {
          errorMessage = err.message;
        }
      }
      
      alert(errorMessage);
      
      if (err.message.includes("expired")) {
        // Update the first message to show it's expired
        if (messages && messages.length > 0) {
          const updatedMessages = [...messages];
          updatedMessages[0] = { ...updatedMessages[0], expired: true };
          setMessages(updatedMessages);
        }
      }
    } finally {
      setSending(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  // Function to compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          
          // Calculate new dimensions (max 1200px width/height while maintaining aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;
          
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to Blob with reduced quality
          canvas.toBlob((blob) => {
            // Create a new file from the blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7); // Adjust quality here (0.7 = 70% quality)
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper function to format date for messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to format date in a more human readable way
  const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
  };

  // Helper function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(msg => {
      if (!msg || !msg.timestamp) return;
      
      const date = new Date(msg.timestamp);
      const dateStr = date.toLocaleDateString();
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(msg);
    });
    
    return groups;
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
        <p className="text-lg">Chọn một người dùng để bắt đầu trò chuyện</p>
      </div>
    );
  }

  // Group messages by date
  const messageGroups = groupMessagesByDate(messages || []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b shadow-sm py-3 px-4 sticky top-0 z-10">
        <div className="flex items-center">
          <div className="relative">
            <img 
              src={selectedUser.patientAvatar || selectedUser.avatar || "https://via.placeholder.com/40"} 
              alt={selectedUser.patientName || selectedUser.name || "Avatar"} 
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              selectedUser.isOnline ? "bg-green-400" : "bg-gray-400"
            }`}></div>
          </div>
          
          <div className="ml-3 flex-1">
            <p className="font-medium text-gray-800">{selectedUser.patientName || selectedUser.name || "Người dùng"}</p>
            <p className="text-xs text-gray-500">
              {selectedUser.isOnline ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Time Left Display */}
      {timeLeft && (
        <div className={`px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 sticky top-16 z-10 ${
          timeLeft === "Hết hạn" 
            ? "bg-red-50 text-red-600 border-b border-red-100" 
            : "bg-blue-50 text-blue-600 border-b border-blue-100"
        }`}>
          <FiClock className="text-base" />
          <span>Thời gian còn lại: {timeLeft}</span>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50"
        onScroll={handleScroll}
      >
        {Object.keys(messageGroups).map(dateStr => (
          <div key={dateStr} className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white text-xs text-gray-500 px-3 py-1 rounded-full shadow-sm">
                {formatMessageDate(dateStr)}
              </div>
            </div>
            
            {messageGroups[dateStr].filter(msg => msg && msg.senderId).map((msg, index) => {
              // Generate a unique key for each message
              const messageKey = msg.id ? 
                `msg-${msg.id}` : 
                (msg.timestamp ? 
                  `time-${msg.timestamp}-${index}` : 
                  `idx-${index}-${msg.content?.substring(0, 10)}`);
              
              const isCurrentUser = msg.senderId === user?.id;
              const showAvatar = !isCurrentUser && (index === 0 || 
                messageGroups[dateStr][index - 1]?.senderId !== msg.senderId);
              
              return (
                <div
                  key={messageKey}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  {!isCurrentUser && showAvatar && (
                    <div className="flex-shrink-0 mr-2">
                      <img 
                        src={selectedUser.patientAvatar || selectedUser.avatar || "https://via.placeholder.com/30"} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  )}
                  
                  {!isCurrentUser && !showAvatar && <div className="w-8 mr-2"></div>}
                  
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white text-gray-800"
                    } ${
                      // Add different border radius based on message sequence
                      index > 0 && messageGroups[dateStr][index - 1]?.senderId === msg.senderId
                        ? isCurrentUser 
                          ? "rounded-tr-lg" 
                          : "rounded-tl-lg"
                        : ""
                    }`}
                  >
                    {msg.imageUrl && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img
                          src={msg.imageUrl}
                          alt="Sent"
                          className="max-w-full"
                          loading="lazy" 
                        />
                      </div>
                    )}
                    {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                    <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                      isCurrentUser ? "text-blue-100" : "text-gray-400"
                    }`}>
                      <span>{formatMessageTime(msg.timestamp)}</span>
                      {isCurrentUser && (
                        msg.read 
                          ? <FiCheckCircle className="text-blue-100" /> 
                          : <FiCheck className="text-blue-100" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-1" />
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-4">
          <button 
            onClick={() => scrollToBottom(true)}
            className="bg-blue-500 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
            aria-label="Cuộn xuống tin nhắn mới nhất"
          >
            <FiArrowDown className="text-lg" />
            {newMessageCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {newMessageCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-3 sticky bottom-0 z-10">
        {messages && messages.length > 0 && messages[0] && messages[0].expired ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 mb-1">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                <FiInfo className="text-lg" />
                <p>Phiên chat đã hết hạn</p>
              </div>
              <p className="text-gray-600 text-sm text-center mb-3">
                Vui lòng thanh toán để tiếp tục trò chuyện với bác sĩ
              </p>
              <button
                onClick={() => {
                  const doctorId = selectedUser.doctorId;
                  if (doctorId) {
                    navigate(`/contact-doctor/${doctorId}`, { state: { expired: true } });
                  } else {
                    alert("Không thể xác định bác sĩ. Vui lòng thử lại sau.");
                  }
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <span>Thanh toán ngay</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full">
            <label className="cursor-pointer flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={sending}
              />
              <FiPaperclip className="text-gray-600 text-xl" />
            </label>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent py-2 px-3 focus:outline-none"
              disabled={sending}
            />
            
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                input.trim() 
                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
