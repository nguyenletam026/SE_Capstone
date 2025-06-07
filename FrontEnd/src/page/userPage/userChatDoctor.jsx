import React, { useEffect, useState } from "react";
import { getAcceptedChatDoctor } from "../../lib/doctor/doctorServices";
import { getConversation, getActiveChatDoctors, getChatHistory } from "../../lib/util/chatServices";
import { connectWebSocket, disconnectWebSocket } from "../../services/websocket";
import ChatContainer from "../../components/chat/chatContainer";
import { useAuth } from "../../context/AuthContext";
import { ChatProvider, useChat } from "../../context/ChatContext";
import { fetchUserInfo } from "../../lib/user/info";
import { getAllDoctorRecommend, getDoctorsForToday, getDoctorsByDateTime, getCurrentAvailableDoctors, getDoctorsWithAvailableSlots } from "../../lib/user/assessmentServices";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FiSearch, 
  FiUser, 
  FiUsers, 
  FiMessageSquare, 
  FiChevronLeft, 
  FiChevronRight,
  FiClock,
  FiCalendar,
  FiStar,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
  FiInfo,
  FiHelpCircle,
  FiArrowRight,
  FiMessageCircle,
  FiHeart,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiFilter,
  FiX,
  FiMaximize2,
  FiMinimize2
} from "react-icons/fi";
import { MdOutlineHealthAndSafety } from "react-icons/md";

export default function UserChatDoctor() {
  return (
    <ChatProvider>
      <UserChatLayout />
    </ChatProvider>
  );
}

function UserChatLayout() {
  const { user, setUser } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const { selectedUser, setSelectedUser, setMessages, setLoading } = useChat();
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Detect window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && selectedUser) {
        setShowSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedUser]);
  
  // Check if we have a doctor to auto-select from navigation state
  useEffect(() => {
    if (location.state?.doctorToChat && user?.id) {
      const doctor = location.state.doctorToChat;
      
      // Ensure the doctor object has a unique ID
      const doctorWithUniqueId = {
        ...doctor,
        uniqueId: doctor.uniqueId || `doctor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      setSelectedUser(doctorWithUniqueId);
      
      // On mobile, hide sidebar when a doctor is selected
      if (isMobile) {
        setShowSidebar(false);
      }
      
      // Load conversation with this doctor
      const loadConversation = async () => {
        setLoading(true);
        try {
          const convo = await getConversation(user.id, doctor.doctorId);
          
          // Ensure each message has a unique ID
          const messagesWithIds = Array.isArray(convo) ? convo.map((msg, index) => {
            if (!msg.id) {
              return {
                ...msg,
                id: `msg-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
              };
            }
            return msg;
          }) : [];

          // Check if the first message indicates an expired chat
          // This ensures even when coming from payment flow, we respect the backend's determination
          const hasExpired = messagesWithIds.length > 0 && messagesWithIds[0].expired;
          if (hasExpired) {
            console.log("⚠️ Chat session expired. Payment required.");
            
            // If navigated from contact-doctor page via payment, but backend still indicates expired,
            // it might be due to a race condition - the payment exists but the first query is too fast
            if (location.state?.fromPayment) {
              toast.info("Đang xác minh trạng thái thanh toán...");
              
              // Wait a moment and try to fetch the conversation again
              setTimeout(async () => {
                try {
                  console.log("🔄 Retrying conversation fetch after payment", { 
                    userId: user.id, 
                    doctorId: doctor.doctorId,
                    fromState: true
                  });
                  const refreshedConvo = await getConversation(user.id, doctor.doctorId);
                  
                  // Log the refreshed conversation status
                  const stillExpired = refreshedConvo.length > 0 && refreshedConvo[0].expired;
                  console.log("📊 Initial navigation retry conversation status:", { 
                    stillExpired, 
                    convoLength: refreshedConvo.length, 
                    firstMessage: refreshedConvo.length > 0 ? refreshedConvo[0] : null,
                    fromPayment: location.state?.fromPayment
                  });
                  
                  if (stillExpired) {
                    toast.warning("Thanh toán có thể chưa được xử lý. Vui lòng kiểm tra lại sau.");
                    console.warn("⚠️ Payment verification failed on navigation - conversation still expired after retry");
                    
                    // If it's still expired, let's try one more time with a longer delay
                    setTimeout(async () => {
                      try {
                        console.log("🔄 Final retry attempt after payment");
                        const finalRetry = await getConversation(user.id, doctor.doctorId);
                        const finallyExpired = finalRetry.length > 0 && finalRetry[0].expired;
                        
                        if (!finallyExpired) {
                          // Success on final retry
                          console.log("✅ Payment verification successful on final retry");
                          toast.success("Thanh toán đã được xác nhận. Bạn có thể gửi tin nhắn ngay bây giờ.");
                          
                          const finalRefreshedMsgs = finalRetry.map((msg, idx) => {
                            if (!msg.id) {
                              return {
                                ...msg,
                                id: `msg-final-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
                              };
                            }
                            return msg;
                          });
                          
                          setMessages(finalRefreshedMsgs);
                        }
                      } catch (finalErr) {
                        console.error("❌ Final retry fetch error:", finalErr);
                      }
                    }, 3500);
                  } else {
                    // Payment verified successfully
                    toast.success("Thanh toán đã được xác nhận. Bạn có thể gửi tin nhắn ngay bây giờ.");
                    console.log("✅ Payment verification successful on navigation - conversation is now valid");
                    
                    // Update messages with non-expired status
                    const refreshedMsgsWithIds = refreshedConvo.map((msg, idx) => {
                      if (!msg.id) {
                        return {
                          ...msg,
                          id: `msg-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
                        };
                      }
                      return msg;
                    });
                    
                    setMessages(refreshedMsgsWithIds);
                    return; // Skip the original setMessages call below
                  }
                } catch (retryErr) {
                  console.error("❌ Retry fetch conversation error:", retryErr);
                }
              }, 2000); // 2 second delay to allow backend to process payment fully
            }
          }
          
          setMessages(messagesWithIds);
        } catch (err) {
          console.error("❌ Lỗi tải cuộc trò chuyện:", err);
          
          // Nếu lỗi là "You do not have permission" hoặc "không tìm thấy yêu cầu tư vấn"
          // thì đánh dấu cuộc trò chuyện là đã hết hạn
          if (err.message && (err.message.includes("permission") || 
              err.message.includes("không tìm thấy yêu cầu tư vấn") ||
              err.message.includes("UNAUTHORIZED"))) {
            // Create a placeholder expired message
            const expiredMessage = {
              id: `expired-${Date.now()}`,
              content: "Phiên chat đã hết hạn hoặc chưa được thanh toán.",
              senderId: "system",
              receiverId: user.id,
              timestamp: new Date().toISOString(),
              expired: true
            };
            setMessages([expiredMessage]);
            
            // Show toast notification
            toast.error("Bạn cần thanh toán để bắt đầu trò chuyện với bác sĩ này.");
            setNotification({
              type: "error",
              message: "Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục."
            });
          } else {
            setMessages([]);
          }
        } finally {
          setLoading(false);
        }
      };
      
      loadConversation();
    }
  }, [location.state, user?.id, setSelectedUser, setMessages, setLoading, navigate, isMobile]);

  useEffect(() => {
    const getUser = async () => {
      if (!user?.id || !user?.username) {
        try {
          const res = await fetchUserInfo();
          setUser({
            ...user,
            id: res.result.id,
            username: res.result.username,
          });
        } catch (err) {
          console.error("❌ Lỗi lấy thông tin người dùng:", err);
        }
      }
    };
    getUser();
  }, [user, setUser]);

  // Kết nối WebSocket khi component mount
  useEffect(() => {
    if (user?.username) {
      connectWebSocket(
        user.username,
        () => {
          console.log("✅ [Patient] WebSocket connected");
        },
        (msg) => {
          try {
            // Sử dụng parsedBody nếu có, nếu không thì parse từ body
            const parsed = msg.parsedBody || JSON.parse(msg.body);
            
            // Ensure message has a unique ID
            if (!parsed.id) {
              parsed.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            setMessages((prev) => [...prev, parsed]);
            
            // Show notification for new messages when sidebar is hidden on mobile
            if (isMobile && !showSidebar) {
              setNotification({
                type: "info",
                message: "Bạn có tin nhắn mới"
              });
              
              // Clear notification after 3 seconds
              setTimeout(() => {
                setNotification(null);
              }, 3000);
            }
          } catch (err) {
            console.error("❌ Failed to parse message:", err);
          }
        },
        (err) => {
          console.error("❌ WebSocket error (patient):", err);
        }
      );
    }
    
    return () => {
      console.log("💤 Disconnecting WebSocket when user chat component unmounts");
      disconnectWebSocket();
    };
  }, [user?.username, setMessages, isMobile, showSidebar]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      console.log("Fetching chat history and available doctors");
      
      let allDoctors = [];
      
      // First, try to get chat history if user is logged in
      if (user?.id) {
        try {
          console.log("Loading chat history for user:", user.id);
          const chatHistory = await getChatHistory(user.id);
          
          if (chatHistory && chatHistory.length > 0) {
            console.log("Found chat history with", chatHistory.length, "doctors");
            
            // Format chat history for display
            const historyDoctors = chatHistory.map(history => ({
              doctorId: history.doctorId,
              doctorName: history.doctorName,
              doctorAvatar: history.doctorAvatar,
              doctorSpecialty: history.specialization || "Bác sĩ tư vấn",
              doctorRating: 4.5, // Default rating, could be added to backend
              isOnline: true, // Could be determined from last activity
              lastActive: history.lastMessageTime || new Date().toISOString(),
              lastMessage: history.lastMessage,
              unreadCount: history.unreadCount || 0,
              hasHistory: true, // Mark this as having chat history
              uniqueId: `history-${history.doctorId}-${Math.random().toString(36).substr(2, 9)}`
            }));
            
            allDoctors = [...historyDoctors];
          }
        } catch (historyErr) {
          console.warn("Failed to load chat history:", historyErr);
          // Continue to load available doctors even if history fails
        }
      }
      
      // Then, get doctors with available slots for new conversations
      try {
        console.log("Loading available doctors for new conversations");
        const doctorsRes = await getDoctorsWithAvailableSlots();
        const scheduledDoctors = doctorsRes.result || [];
        
        if (scheduledDoctors.length > 0) {
          console.log("Found doctors with available slots:", scheduledDoctors.length);
          
          // Format available doctors for display
          const availableDoctors = scheduledDoctors.map(d => ({
            doctorId: d.id,
            doctorName: `${d.firstName} ${d.lastName}`,
            doctorAvatar: d.avtUrl,
            doctorSpecialty: d.specialty || "Bác sĩ tư vấn",
            doctorRating: d.rating || 4.5,
            isOnline: true,
            lastActive: new Date().toISOString(),
            hasHistory: false, // Mark this as available for new conversation
            uniqueId: `available-${d.id}-${Math.random().toString(36).substr(2, 9)}`
          }));
          
          // Filter out doctors that are already in chat history to avoid duplicates
          const historyDoctorIds = allDoctors.map(d => d.doctorId);
          const newDoctors = availableDoctors.filter(d => !historyDoctorIds.includes(d.doctorId));
          
          allDoctors = [...allDoctors, ...newDoctors];
        }
      } catch (availableErr) {
        console.warn("Failed to load available doctors:", availableErr);
      }
      
      if (allDoctors.length > 0) {
        console.log("Total doctors loaded:", allDoctors.length);
        setDoctors(allDoctors);
      } else {
        console.log("No doctors found");
        setDoctors([]);
      }
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách bác sĩ:", err);
      setDoctors([]);
      setNotification({
        type: "error",
        message: "Không thể lấy danh sách bác sĩ. Vui lòng thử lại sau."
      });
    } finally {
      setLoadingDoctors(false);
    }
  };
  
  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSelect = async (doc) => {
    if (!user?.id || !doc?.doctorId) {
      console.warn("⚠️ Thiếu userId hoặc doctorId");
      return;
    }

    setSelectedUser(doc);
    
    // On mobile, hide sidebar when a doctor is selected
    if (isMobile) {
      setShowSidebar(false);
    }
    
    setLoading(true);
    try {
      const convo = await getConversation(user.id, doc.doctorId);
      
      // Ensure each message has a unique ID
      const messagesWithIds = Array.isArray(convo) ? convo.map((msg, index) => {
        if (!msg.id) {
          return {
            ...msg,
            id: `msg-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
          };
        }
        return msg;
      }) : [];
      
      // Check if the first message indicates payment required
      const hasExpired = messagesWithIds.length > 0 && messagesWithIds[0].expired;
      if (hasExpired) {
        console.log("⚠️ Chat session expired. Payment required.");
        
        // Check if we just navigated from payment flow
        const fromPayment = location.state?.fromPayment;
        
        // If coming from payment flow, implement retry logic for race condition
        if (fromPayment) {
          toast.info("Đang xác minh trạng thái thanh toán...");
          
          // Wait a moment and try to fetch the conversation again
          setTimeout(async () => {
            try {
              console.log("🔄 Retrying conversation fetch after payment - handleSelect", { userId: user.id, doctorId: doc.doctorId });
              const refreshedConvo = await getConversation(user.id, doc.doctorId);
              
              // Log the refreshed conversation status
              const stillExpired = refreshedConvo.length > 0 && refreshedConvo[0].expired;
              console.log("📊 Retry conversation status:", { 
                stillExpired, 
                convoLength: refreshedConvo.length, 
                firstMessage: refreshedConvo.length > 0 ? refreshedConvo[0] : null 
              });
              
              if (stillExpired) {
                toast.warning("Thanh toán có thể chưa được xử lý. Vui lòng kiểm tra lại sau.");
                console.warn("⚠️ Payment verification failed - conversation still expired after retry");
              } else {
                // Payment verified successfully
                toast.success("Thanh toán đã được xác nhận. Bạn có thể gửi tin nhắn ngay bây giờ.");
                console.log("✅ Payment verification successful - conversation is now valid");
                
                // Update messages with non-expired status
                const refreshedMsgsWithIds = refreshedConvo.map((msg, idx) => {
                  if (!msg.id) {
                    return {
                      ...msg,
                      id: `msg-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
                    };
                  }
                  return msg;
                });
                
                setMessages(refreshedMsgsWithIds);
                return; // Skip the original setMessages call
              }
            } catch (retryErr) {
              console.error("❌ Retry fetch conversation error in handleSelect:", retryErr);
            }
          }, 2000); // 2 second delay to allow backend to process payment fully
        }
      }
      
      setMessages(messagesWithIds);
    } catch (err) {
      console.error("❌ Lỗi tải cuộc trò chuyện:", err);
      
      // Nếu lỗi là "You do not have permission" hoặc "không tìm thấy yêu cầu tư vấn"
      // thì đánh dấu cuộc trò chuyện là đã hết hạn
      if (err.message && (err.message.includes("permission") || 
          err.message.includes("không tìm thấy yêu cầu tư vấn") ||
          err.message.includes("UNAUTHORIZED"))) {
        // Create a placeholder expired message
        const expiredMessage = {
          id: `expired-${Date.now()}`,
          content: "Phiên chat đã hết hạn hoặc chưa được thanh toán.",
          senderId: "system",
          receiverId: user.id,
          timestamp: new Date().toISOString(),
          expired: true
        };
        setMessages([expiredMessage]);
        
        // If coming from payment flow, implement retry logic
        if (location.state?.fromPayment) {
          toast.info("Đang xác minh trạng thái thanh toán...");
          
          setTimeout(async () => {
            try {
              const refreshedConvo = await getConversation(user.id, doc.doctorId);
              
              // If successful, update the messages
              const refreshedMsgsWithIds = refreshedConvo.map((msg, idx) => {
                if (!msg.id) {
                  return {
                    ...msg, 
                    id: `msg-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
                  };
                }
                return msg;
              });
              
              setMessages(refreshedMsgsWithIds);
              toast.success("Thanh toán đã được xác nhận thành công.");
            } catch (retryErr) {
              console.error("❌ Retry fetch conversation error after permission error:", retryErr);
              setNotification({
                type: "warning",
                message: "Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục."
              });
            }
          }, 2500); // Slightly longer delay for permission errors
        } else {
          setNotification({
            type: "warning",
            message: "Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục."
          });
        }
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(doc => 
    doc.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.doctorSpecialty && doc.doctorSpecialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loadingDoctors && doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white">
        <MdOutlineHealthAndSafety className="text-5xl text-blue-500 mb-4 animate-pulse" />
        <div className="text-xl font-medium text-gray-700 mb-2">Đang tải danh sách bác sĩ</div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  const renderSidebar = () => (
    <aside 
      className={`${
        isMobile && !showSidebar ? 'hidden' : 'flex'
      } ${
        isMobile ? 'absolute inset-y-0 left-0 z-20 w-full' : 'w-96'
      } flex-col bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/50 border-r border-gradient backdrop-blur-xl relative overflow-hidden transition-all duration-300`}
    >
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Header Section */}
      <div className="relative z-10 p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20">
                <FiMessageCircle className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Healthcare Chat</h2>
                <p className="text-white/80 text-sm">Connect with professionals</p>
              </div>
            </div>
            
            {isMobile && (
              <button 
                onClick={() => setShowSidebar(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <FiX className="text-white" size={20} />
              </button>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center space-x-2 text-white/90">
                <FiUsers size={16} />
                <span className="text-sm font-medium">{filteredDoctors.length} Online</span>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center space-x-2 text-white/90">
                <FiActivity size={16} />
                <span className="text-sm font-medium">Active Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative z-10 p-6 bg-white/60 backdrop-blur-sm border-b border-white/30">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent placeholder-gray-500 text-gray-700 shadow-sm transition-all duration-300"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Doctor List */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {loadingDoctors ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
              <FiSearch className="text-gray-500" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No doctors available</h3>
            <p className="text-sm text-gray-500">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "No doctors are currently available for consultation"}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.uniqueId || doctor.doctorId}
                onClick={() => handleSelect(doctor)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedUser?.doctorId === doctor.doctorId || selectedUser?.uniqueId === doctor.uniqueId
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 border border-gray-100/50 hover:border-indigo-200/50 hover:shadow-lg"
                }`}
              >
                {/* Active indicator */}
                {(selectedUser?.doctorId === doctor.doctorId || selectedUser?.uniqueId === doctor.uniqueId) && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md ${
                      selectedUser?.doctorId === doctor.doctorId || selectedUser?.uniqueId === doctor.uniqueId
                        ? "bg-white/20 text-white border-2 border-white/30"
                        : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                    }`}>
                      {doctor.doctorName?.charAt(0) || doctor.name?.charAt(0) || 'D'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm">
                      <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate group-hover:text-current transition-colors">
                      {doctor.doctorName || doctor.name || 'Dr. Professional'}
                    </h3>
                    <p className={`text-sm truncate ${
                      selectedUser?.doctorId === doctor.doctorId || selectedUser?.uniqueId === doctor.uniqueId
                        ? "text-white/80"
                        : "text-gray-500"
                    }`}>
                      {doctor.specialty || doctor.specialization || 'General Practitioner'}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <div className={`flex items-center space-x-1 ${
                        selectedUser?.doctorId === doctor.doctorId || selectedUser?.uniqueId === doctor.uniqueId
                          ? "text-white/80"
                          : "text-green-600"
                      }`}>
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">Online</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        selectedUser?.doctorId === doctor.doctorId || selectedUser?.uniqueId === doctor.uniqueId
                          ? "text-white/70"
                          : "text-yellow-500"
                      }`}>
                        <FiStar size={12} />
                        <span className="text-xs">4.9</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${
                    selectedUser?.doctorId === doctor.doctorId || selectedUser?.uniqueId === doctor.uniqueId
                      ? "text-white/80"
                      : "text-indigo-500"
                  } group-hover:translate-x-1 transition-transform`}>
                    <FiChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="relative z-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-200/50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors">
            <FiShield size={16} />
            <span className="font-medium">Privacy</span>
          </div>
          <div className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors">
            <FiHelpCircle size={16} />
            <span className="font-medium">Support</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 relative overflow-hidden">
      {/* Enhanced Mobile sidebar toggle buttons */}
      {isMobile && selectedUser && !showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className="absolute top-4 left-4 z-30 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-2xl backdrop-blur-sm hover:scale-110 transition-all duration-300 hover:shadow-indigo-500/25"
          aria-label="Mở danh sách bác sĩ"
        >
          <FiChevronRight className="text-lg" />
        </button>
      )}
      
      {/* Enhanced Mobile sidebar close button */}
      {isMobile && showSidebar && (
        <button 
          onClick={() => setShowSidebar(false)}
          className="absolute top-4 right-4 z-30 p-3 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-lg border border-white/20"
          aria-label="Đóng danh sách bác sĩ"
        >
          <FiChevronLeft className="text-lg" />
        </button>
      )}
      
      {/* Sidebar with doctor list */}
      {renderSidebar()}

      {/* Chat area */}
      <div className={`${isMobile && showSidebar ? 'hidden' : 'flex'} flex-1 flex-col h-full overflow-hidden relative transition-all duration-300`}>
        {/* Animated background for main chat area */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 overflow-hidden">
          {/* Floating animated elements */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-green-400/10 to-teal-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {selectedUser ? (
          <div className="relative z-10 flex-1 flex flex-col">
            <ChatContainer />
          </div>
        ) : (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-2xl">
              {/* Animated hero icons */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {/* Main chat icon with pulse animation */}
                  <div className="relative p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl">
                    <FiMessageSquare className="text-5xl text-white relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  
                  {/* Floating health icon */}
                  <div className="absolute -top-2 -right-2 p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-full shadow-xl animate-bounce">
                    <MdOutlineHealthAndSafety className="text-2xl text-white" />
                  </div>
                  
                  {/* Floating heart icon */}
                  <div className="absolute -bottom-1 -left-3 p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full shadow-lg animate-pulse">
                    <FiHeart className="text-lg text-white" />
                  </div>
                </div>
              </div>

              {/* Enhanced welcome content */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome to Healthcare Chat
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Kết nối với đội ngũ bác sĩ chuyên môn hàng đầu. Nhận tư vấn y tế chính xác, 
                  kịp thời và đáng tin cậy mọi lúc, mọi nơi.
                </p>
                
                {/* Feature highlights with beautiful cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100/50 hover:border-indigo-200/70 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiClock className="text-xl text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">24/7 Available</h3>
                      <p className="text-sm text-gray-600">Hỗ trợ y tế liên tục, không giới hạn thời gian</p>
                    </div>
                  </div>
                  
                  <div className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100/50 hover:border-green-200/70 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiShield className="text-xl text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">Secure & Private</h3>
                      <p className="text-sm text-gray-600">Thông tin bệnh nhân được bảo mật tuyệt đối</p>
                    </div>
                  </div>
                  
                  <div className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100/50 hover:border-pink-200/70 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FiZap className="text-xl text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">Instant Response</h3>
                      <p className="text-sm text-gray-600">Phản hồi nhanh chóng từ chuyên gia y tế</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => {
                    if (filteredDoctors.length > 0) {
                      handleSelect(filteredDoctors[0]);
                    }
                  }}
                  disabled={filteredDoctors.length === 0}
                  className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    filteredDoctors.length > 0 
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {filteredDoctors.length > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <FiMessageCircle className="text-xl" />
                    <span>Bắt đầu trò chuyện</span>
                    <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
                
                <div className="text-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FiTrendingUp className="text-green-500" />
                    <span>
                      <span className="font-semibold text-green-600">{filteredDoctors.length}</span> bác sĩ đang online
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Nhấn để kết nối với bác sĩ có sẵn đầu tiên
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 pt-8 border-t border-gray-200/50">
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-green-500" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineHealthAndSafety className="text-blue-500" />
                    <span>Medical Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiHeart className="text-pink-500" />
                    <span>Patient Focused</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Notification System */}
      {notification && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border transition-all duration-300 animate-slide-down ${
          notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400/50' :
          notification.type === 'warning' ? 'bg-amber-500/90 text-white border-amber-400/50' :
          'bg-indigo-500/90 text-white border-indigo-400/50'
        }`}>
          <div className={`p-2 rounded-full ${
            notification.type === 'error' ? 'bg-red-400/30' :
            notification.type === 'warning' ? 'bg-amber-400/30' :
            'bg-indigo-400/30'
          }`}>
            {notification.type === 'error' ? <FiAlertCircle className="text-lg" /> :
             notification.type === 'warning' ? <FiAlertCircle className="text-lg" /> :
             <FiInfo className="text-lg" />}
          </div>
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
}
