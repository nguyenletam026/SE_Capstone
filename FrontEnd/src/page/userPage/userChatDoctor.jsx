import React, { useEffect, useState } from "react";
import { getAcceptedChatDoctor } from "../../lib/doctor/doctorServices";
import { getConversation, getActiveChatDoctors } from "../../lib/util/chatServices";
import { connectWebSocket, disconnectWebSocket } from "../../services/websocket";
import ChatContainer from "../../components/chat/chatContainer";
import { useAuth } from "../../context/AuthContext";
import { ChatProvider, useChat } from "../../context/ChatContext";
import { fetchUserInfo } from "../../lib/user/info";
import { getAllDoctorRecommend, getDoctorsForToday, getDoctorsByDateTime, getCurrentAvailableDoctors } from "../../lib/user/assessmentServices";
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
  FiArrowRight
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
      console.log("Fetching currently available doctors using server time");
      
      // Get doctors scheduled for the current server time
      const doctorsRes = await getCurrentAvailableDoctors();
      const scheduledDoctors = doctorsRes.result || [];
      
      if (scheduledDoctors.length > 0) {
        console.log("Found available doctors:", scheduledDoctors.length);
        
        // Format doctors for display
        const formattedDoctors = scheduledDoctors.map(d => ({
          doctorId: d.id,
          doctorName: `${d.firstName} ${d.lastName}`,
          doctorAvatar: d.avtUrl,
          doctorSpecialty: d.specialty || "Bác sĩ tư vấn",
          doctorRating: d.rating || 4.5,
          isOnline: true,
          lastActive: new Date().toISOString(),
          uniqueId: `doctor-${d.id}-${Math.random().toString(36).substr(2, 9)}`
        }));
        
        setDoctors(formattedDoctors);
      } else {
        console.log("No available doctors found at current server time");
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
      
      setMessages(messagesWithIds);
    } catch (err) {
      console.error("❌ Lỗi tải cuộc trò chuyện:", err);
      
      // Nếu lỗi là "You do not have permission" hoặc "không tìm thấy yêu cầu tư vấn"
      // thì đánh dấu cuộc trò chuyện là đã hết hạn
      if (err.message && (err.message.includes("permission") || 
          err.message.includes("không tìm thấy yêu cầu tư vấn"))) {
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
        setNotification({
          type: "warning",
          message: "Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục."
        });
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
    <aside className={`${isMobile ? (showSidebar ? 'block absolute z-20 h-full' : 'hidden') : 'block'} w-80 bg-white border-r overflow-hidden flex flex-col h-full transition-all duration-300 shadow-lg`}>
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FiMessageSquare className="text-2xl" />
          <span>Phòng Chat</span>
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Trò chuyện với bác sĩ của bạn
        </p>
      </div>
      
      <div className="p-3 border-b bg-blue-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
          />
          <FiSearch className="absolute left-3 top-2.5 text-blue-400" />
        </div>
      </div>
      
      <div className="p-3 border-b bg-blue-50 flex items-center justify-between">
        <h3 className="text-sm font-medium text-blue-800 flex items-center gap-1">
          <FiUsers className="text-blue-500" />
          <span>Bác sĩ đang trực tuyến</span>
        </h3>
        <button 
          onClick={fetchDoctors} 
          className="p-1.5 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
          title="Làm mới danh sách"
        >
          <FiRefreshCw className="text-sm" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-blue-50">
        {filteredDoctors.length === 0 ? (
          <div className="p-6 text-center">
            <FiAlertCircle className="text-3xl text-blue-300 mx-auto mb-2" />
            <p className="text-gray-500">
              {searchTerm ? "Không tìm thấy bác sĩ phù hợp" : "Không có bác sĩ nào đang trực tuyến"}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-2 text-sm text-blue-500 hover:underline"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y">
            {filteredDoctors.map((doc) => (
              <li
                key={doc.uniqueId || doc.doctorId}
                onClick={() => handleSelect(doc)}
                className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                  selectedUser?.doctorId === doc.doctorId ? "bg-blue-100" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={doc.doctorAvatar || "https://via.placeholder.com/40"}
                      alt={doc.doctorName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    />
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      doc.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-medium text-gray-800 ${
                        selectedUser?.doctorId === doc.doctorId ? "text-blue-700" : ""
                      }`}>
                        {doc.doctorName}
                      </h4>
                      <div className="flex items-center text-yellow-500 text-xs">
                        <FiStar className="text-yellow-400 fill-current" />
                        <span className="ml-1">{doc.doctorRating}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <MdOutlineHealthAndSafety className="mr-1 text-blue-500" />
                      {doc.doctorSpecialty}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400 flex items-center">
                        <FiClock className="mr-1" />
                        {doc.isOnline ? "Đang hoạt động" : "Hoạt động gần đây"}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                        Trực tuyến
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-4 border-t bg-blue-50">
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
          <FiInfo className="text-blue-500" />
          <span>Liên hệ hỗ trợ</span>
          <FiHelpCircle className="text-blue-500 cursor-pointer" />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 relative overflow-hidden">
      {/* Mobile sidebar toggle button */}
      {isMobile && selectedUser && !showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className="absolute top-2 left-2 z-30 bg-blue-500 text-white rounded-full p-2 shadow-lg"
          aria-label="Mở danh sách bác sĩ"
        >
          <FiChevronRight />
        </button>
      )}
      
      {/* Mobile sidebar close button */}
      {isMobile && showSidebar && (
        <button 
          onClick={() => setShowSidebar(false)}
          className="absolute top-2 right-2 z-30 bg-white text-blue-500 rounded-full p-2 shadow-lg"
          aria-label="Đóng danh sách bác sĩ"
        >
          <FiChevronLeft />
        </button>
      )}
      
      {/* Sidebar with doctor list */}
      {renderSidebar()}

      {/* Chat area */}
      <div className={`${isMobile && showSidebar ? 'hidden' : 'flex'} flex-1 flex-col h-full overflow-hidden bg-gray-50 transition-all duration-300`}>
        {selectedUser ? (
          <ChatContainer />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
            <div className="text-center max-w-md">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <FiMessageSquare className="text-6xl text-blue-500" />
                  <MdOutlineHealthAndSafety className="text-3xl text-blue-600 absolute -right-1 -bottom-1" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Chào mừng đến với Phòng Chat</h2>
              <p className="text-gray-600 mb-6">
                Hãy chọn một bác sĩ từ danh sách để bắt đầu cuộc trò chuyện. 
                Bạn có thể tham khảo ý kiến, đặt câu hỏi và nhận lời khuyên y tế từ các bác sĩ chuyên môn.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <FiCalendar className="text-xl text-blue-500 mb-2" />
                  <h3 className="font-medium text-gray-800 mb-1">Lịch trình linh hoạt</h3>
                  <p className="text-sm text-gray-600">Trò chuyện với bác sĩ mọi lúc, mọi nơi</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                  <FiUser className="text-xl text-blue-500 mb-2" />
                  <h3 className="font-medium text-gray-800 mb-1">Bác sĩ chuyên môn</h3>
                  <p className="text-sm text-gray-600">Được tư vấn bởi đội ngũ y bác sĩ giàu kinh nghiệm</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (filteredDoctors.length > 0) {
                    handleSelect(filteredDoctors[0]);
                  }
                }}
                disabled={filteredDoctors.length === 0}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full ${
                  filteredDoctors.length > 0 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                } transition-colors shadow-md`}
              >
                <span>Kết nối với bác sĩ</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-500 text-white' :
          notification.type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.type === 'error' ? <FiAlertCircle /> :
           notification.type === 'warning' ? <FiAlertCircle /> :
           <FiInfo />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
