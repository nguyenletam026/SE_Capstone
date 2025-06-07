import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { sendMessage, sendMessageWithImage } from "../../lib/util/chatServices";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FiSend, 
  FiPaperclip, 
  FiClock, 
  FiInfo,
  FiArrowRight,
  FiArrowDown,
  FiCheck,
  FiCheckCircle,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiSmile,
  FiImage,
  FiMic,
  FiHeart,
  FiStar,
  FiShield
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

  // Chat session expiration notification and page reload
  const [hasShownExpirationNotification, setHasShownExpirationNotification] = useState(false);
  
  useEffect(() => {
    if (timeLeft === "Hết hạn" && messages && messages.length > 0 && !hasShownExpirationNotification) {
      // Show notification when chat session expires (only once)
      toast.error("Phiên chat đã kết thúc.", {
        duration: 4000,
        position: "top-center"
      });
      
      // Mark that we've shown the notification
      setHasShownExpirationNotification(true);
      
      // Update the first message to mark as expired
      const updatedMessages = [...messages];
      if (updatedMessages[0]) {
        updatedMessages[0] = { ...updatedMessages[0], expired: true };
        setMessages(updatedMessages);
      }
    } else if (timeLeft !== "Hết hạn" && hasShownExpirationNotification) {
      // Reset the flag if chat session becomes valid again
      setHasShownExpirationNotification(false);
    }
  }, [timeLeft, messages, setMessages, hasShownExpirationNotification]);

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
    
    // Declare receiverId in the outer scope so it's accessible in the catch block
    let receiverId;

    try {
      // Determine the correct recipient ID based on the selected user structure
      
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
      const errorMessage = err.message || "";
      
      // If payment is required, mark the chat as expired
      if (errorMessage.includes("Vui lòng thanh toán") || 
          errorMessage.includes("Payment required") ||
          errorMessage.includes("hết hạn")) {
          
        // Check if we just came from a payment flow
        const locationState = window.history.state?.usr?.state;
        if (locationState?.fromPayment) {
          toast.info("Đang xác minh trạng thái thanh toán...");
          
          // Capture receiverId in closure to ensure it's available in setTimeout
          const capturedReceiverId = receiverId;
          
          // Retry sending the message after a short delay to allow backend to process payment
          setTimeout(async () => {
            try {
              setSending(true);
              console.log("🔄 Retrying message send after payment", { senderId: user.id, receiverId: capturedReceiverId });
              const retryResponse = await sendMessage(content, user.id, capturedReceiverId);
              
              if (retryResponse) {
                // Success! Payment is now recognized
                console.log("✅ Payment verification successful - message sent successfully", retryResponse);
                
                const retryMessage = {
                  id: retryResponse.id,
                  content: content,
                  senderId: user.id,
                  senderName: user.username,
                  receiverId: capturedReceiverId,
                  timestamp: new Date().toISOString(),
                  read: false
                };
                
                // Add the message to the conversation
                setMessages(prev => [...prev, retryMessage]);
                toast.success("Tin nhắn đã được gửi thành công!");
                
                // Force scroll to bottom
                setTimeout(() => scrollToBottom(true), 100);
                return;
              }
            } catch (retryErr) {
              console.error("❌ Retry send error:", retryErr);
              console.warn("⚠️ Payment verification failed - message still couldn't be sent", retryErr.message);
              
              // Now update the message as expired since retry failed too
              if (messages && messages.length > 0) {
                const updatedMessages = [...messages];
                updatedMessages[0] = { ...updatedMessages[0], expired: true };
                setMessages(updatedMessages);
              }
            } finally {
              setSending(false);
            }
          }, 2000); // 2 second delay
        } else {
          // Regular expired payment case - update UI immediately
          if (messages && messages.length > 0) {
            const updatedMessages = [...messages];
            updatedMessages[0] = { ...updatedMessages[0], expired: true };
            setMessages(updatedMessages);
          }
        }
      } else {
        // For other types of errors
        toast.error(errorMessage || "Không thể gửi tin nhắn. Vui lòng thử lại sau.");
      }
    } finally {
      // Only set sending to false if we're not in a retry situation
      const locationState = window.history.state?.usr?.state;
      if (!locationState?.fromPayment) {
        setSending(false);
      }
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
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Enhanced Chat Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-3 border-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                  <img 
                    src={selectedUser.doctorAvatar || selectedUser.patientAvatar || selectedUser.avatar || "https://via.placeholder.com/48"} 
                    alt={(selectedUser.doctorName || selectedUser.patientName || selectedUser.name || "Avatar") + " avatar"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Enhanced online indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-md ${
                  selectedUser.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}>
                  {selectedUser.isOnline && (
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-40"></div>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">
                  {selectedUser.doctorName || selectedUser.patientName || selectedUser.name || "Người dùng"}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 text-sm ${
                    selectedUser.isOnline ? "text-green-600" : "text-gray-500"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      selectedUser.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}></div>
                    <span className="font-medium">
                      {selectedUser.isOnline ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                  {selectedUser.doctorSpecialty && (
                    <div className="text-gray-400">•</div>
                  )}
                  {selectedUser.doctorSpecialty && (
                    <span className="text-sm text-indigo-600 font-medium">
                      {selectedUser.doctorSpecialty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 hover:scale-105">
                <FiPhone size={18} />
              </button>
              <button className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-105">
                <FiVideo size={18} />
              </button>
              <button className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105">
                <FiMoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Time Left Display */}
      {timeLeft && (
        <div className={`relative z-10 px-6 py-3 text-sm font-semibold flex items-center justify-center gap-3 backdrop-blur-sm ${
          timeLeft === "Hết hạn" 
            ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-b border-red-200/50" 
            : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-b border-blue-200/50"
        }`}>
          <div className={`p-2 rounded-xl ${
            timeLeft === "Hết hạn" ? "bg-red-100" : "bg-blue-100"
          }`}>
            <FiClock className="text-base" />
          </div>
          <span>Thời gian còn lại: {timeLeft}</span>
          {timeLeft !== "Hết hạn" && (
            <div className="ml-2 flex items-center space-x-1">
              <FiShield className="text-green-500" size={14} />
              <span className="text-xs text-green-600 font-medium">Được bảo vệ</span>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Messages */}
      <div 
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto p-6 space-y-8"
        onScroll={handleScroll}
      >
        {Object.keys(messageGroups).map(dateStr => (
          <div key={dateStr} className="space-y-6">
            {/* Enhanced date separator */}
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm text-xs text-gray-600 px-4 py-2 rounded-full shadow-sm border border-gray-200/50 font-medium">
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
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} group`}
                >
                  {/* Avatar for received messages */}
                  {!isCurrentUser && showAvatar && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-gray-100 to-gray-200">
                        <img 
                          src={selectedUser.doctorAvatar || selectedUser.patientAvatar || selectedUser.avatar || "https://via.placeholder.com/40"} 
                          alt={(selectedUser.doctorName || selectedUser.patientName || selectedUser.name || "Người dùng") + " avatar"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {!isCurrentUser && !showAvatar && <div className="w-10 mr-3"></div>}
                  
                  {/* Enhanced message bubble */}
                  <div className="flex flex-col max-w-[75%]">
                    <div
                      className={`relative px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                        isCurrentUser
                          ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white ml-auto"
                          : "bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50"
                      } ${
                        // Add different border radius based on message sequence
                        index > 0 && messageGroups[dateStr][index - 1]?.senderId === msg.senderId
                          ? isCurrentUser 
                            ? "rounded-tr-lg" 
                            : "rounded-tl-lg"
                          : ""
                      }`}
                    >
                      {/* Message glow effect for sent messages */}
                      {isCurrentUser && (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                      )}
                      
                      {/* Image message */}
                      {msg.imageUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden shadow-md">
                          <img
                            src={msg.imageUrl}
                            alt="Sent"
                            className="max-w-full rounded-xl hover:scale-105 transition-transform duration-300"
                            loading="lazy" 
                          />
                        </div>
                      )}
                      
                      {/* Text content */}
                      {msg.content && (
                        <p className="leading-relaxed whitespace-pre-wrap text-sm lg:text-base">
                          {msg.content}
                        </p>
                      )}
                      
                      {/* Message metadata */}
                      <div className={`flex items-center justify-end gap-2 mt-2 text-xs ${
                        isCurrentUser ? "text-white/80" : "text-gray-500"
                      }`}>
                        <span className="font-medium">{formatMessageTime(msg.timestamp)}</span>
                        {isCurrentUser && (
                          <div className="flex items-center">
                            {msg.read 
                              ? <FiCheckCircle className="text-white/90" size={14} /> 
                              : <FiCheck className="text-white/70" size={14} />
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Message reactions placeholder */}
                    {(isCurrentUser || !isCurrentUser) && (
                      <div className={`flex items-center mt-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}>
                        <button className="p-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white shadow-sm hover:scale-110 transition-all duration-200">
                          <FiHeart size={12} />
                        </button>
                        <button className="p-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white shadow-sm hover:scale-110 transition-all duration-200">
                          <FiStar size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-1" />
      </div>
      
      {/* Enhanced Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-32 right-6 z-20">
          <button 
            onClick={() => scrollToBottom(true)}
            className="group relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-center hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce"
            aria-label="Cuộn xuống tin nhắn mới nhất"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
            
            <FiArrowDown className="relative z-10 text-xl transform group-hover:translate-y-1 transition-transform duration-300" />
            
            {newMessageCount > 0 && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full h-7 w-7 flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                <span className="font-bold">{newMessageCount}</span>
              </div>
            )}
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
          </button>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl sticky bottom-0">
        <div className="p-6">
          {messages && messages.length > 0 && messages[0] && messages[0].expired ? (
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border border-red-200/50 shadow-lg overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/20 to-pink-300/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-red-300/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-3 text-red-600 font-bold mb-3">
                  <div className="p-3 rounded-2xl bg-red-100/80 backdrop-blur-sm">
                    <FiInfo className="text-xl" />
                  </div>
                  <p className="text-lg">Phiên chat đã hết hạn</p>
                </div>
                <p className="text-gray-700 text-sm text-center mb-4 leading-relaxed">
                  Để tiếp tục trò chuyện với bác sĩ, vui lòng thực hiện thanh toán
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
                  className="group relative flex items-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                  
                  <span className="relative z-10">Thanh toán ngay</span>
                  <FiArrowRight className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative bg-gray-50/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-200/50 overflow-hidden">
              {/* Input background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-pink-50/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                {/* Enhanced attachment button */}
                <label className="group cursor-pointer flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={sending}
                  />
                  <FiImage className="text-gray-600 group-hover:text-indigo-600 text-xl transition-colors duration-300" />
                </label>

                {/* Enhanced emoji button */}
                <button className="group flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                  <FiSmile className="text-orange-600 text-xl group-hover:rotate-12 transition-transform duration-300" />
                </button>
                
                {/* Enhanced input field */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Nhập tin nhắn của bạn..."
                    className="w-full bg-white/80 backdrop-blur-sm py-3 px-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white shadow-sm border border-gray-200/50 text-gray-800 placeholder-gray-500 transition-all duration-300"
                    disabled={sending}
                  />
                  {/* Input focus glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Enhanced voice message button */}
                <button className="group flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                  <FiMic className="text-green-600 text-xl group-hover:scale-110 transition-transform duration-300" />
                </button>
                
                {/* Enhanced send button */}
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className={`group relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl ${
                    input.trim() 
                      ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600" 
                      : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {/* Send button glow effect */}
                  {input.trim() && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                  )}
                  
                  {sending ? (
                    <div className="relative z-10 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiSend className="relative z-10 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
