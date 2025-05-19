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
  const location = useLocation();
  const navigate = useNavigate();
  
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
          } else {
            setMessages([]);
          }
        } finally {
          setLoading(false);
        }
      };
      
      loadConversation();
    }
  }, [location.state, user?.id, setSelectedUser, setMessages, setLoading, navigate]);

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

  useEffect(() => {
    if (user?.username) {
      connectWebSocket(
        user.username,
        () => console.log("✅ WebSocket connected"),
        (msg) => {
          try {
            const parsed = JSON.parse(msg.body);
            if (parsed && parsed.senderId && parsed.content) {
              // Add a unique ID to the message if it doesn't have one
              if (!parsed.id) {
                parsed.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              }
              setMessages((prev) => [...prev, parsed]);
            } else {
              console.warn("Received invalid message format:", parsed);
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        },
        (err) => console.error("❌ WebSocket error:", err)
      );
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user?.username, setMessages]);

  useEffect(() => {
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
      } finally {
        setLoadingDoctors(false);
      }
    };
    
    fetchDoctors();
  }, []);

  const handleSelect = async (doc) => {
    if (!user?.id || !doc?.doctorId) {
      console.warn("⚠️ Thiếu userId hoặc doctorId");
      return;
    }

    setSelectedUser(doc);
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
      } else {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingDoctors) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="w-64 bg-white border-r overflow-y-auto">
        <h3 className="text-lg font-bold text-center py-4 border-b">Bác sĩ</h3>
        {doctors.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Không tìm thấy bác sĩ nào.</p>
          </div>
        ) : (
          <ul>
            {doctors.map((doc) => (
              <li
                key={doc.uniqueId || doc.doctorId}
                onClick={() => handleSelect(doc)}
                className={`px-4 py-3 cursor-pointer hover:bg-green-50 transition ${
                  selectedUser?.doctorId === doc.doctorId ? "bg-green-100 font-semibold" : ""
                }`}
              >
                <div className="flex items-center gap-3 text-black">
                  <img
                    src={doc.doctorAvatar || "/default-avatar.png"}
                    alt={doc.doctorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm">{doc.doctorName}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <div className="flex-1">
        <ChatContainer />
      </div>
    </div>
  );
}
