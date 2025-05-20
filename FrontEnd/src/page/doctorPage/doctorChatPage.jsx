import React, { useEffect, useState } from "react";
import { getAcceptedChatPatients, getPaidChatPatients } from "../../lib/doctor/doctorServices";
import { getConversation } from "../../lib/util/chatServices";
import { connectWebSocket, disconnectWebSocket, registerMessageHandler } from "../../services/websocket";
import ChatContainer from "../../components/chat/chatContainer";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { fetchUserInfo } from "../../lib/user/info";

function DoctorChatLayout() {
  const { user, setUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const { selectedUser, setSelectedUser, setMessages, setLoading } = useChat();
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [hasNewChatRequests, setHasNewChatRequests] = useState(false);

  useEffect(() => {
    const getDoctor = async () => {
      if (!user?.id || !user?.username) {
        try {
          const res = await fetchUserInfo();
          setUser({
            ...user,
            id: res.result.id,
            username: res.result.username,
          });
        } catch (err) {
          console.error("❌ Lỗi lấy thông tin bác sĩ:", err);
        }
      }
    };
    getDoctor();
  }, [user, setUser]);

  // Xử lý tin nhắn WebSocket
  const handleMessage = (msg) => {
    try {
      // Sử dụng parsedBody thay vì phân tích lại body
      const parsed = msg.parsedBody || JSON.parse(msg.body);
      
      console.log("📨 Doctor chat received message:", parsed);
      
      // Check if this is a chat notification
      if (parsed.type === "NEW_CHAT_REQUEST" || parsed.type === "NEW_CHAT_PAYMENT") {
        setHasNewChatRequests(true);
        return;
      }
      
      // Add a unique ID to the message if it doesn't have one
      if (!parsed.id) {
        parsed.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      setMessages((prev) => [...prev, parsed]);
    } catch (err) {
      console.error("❌ Failed to parse message:", err);
    }
  };

  useEffect(() => {
    if (user?.username) {
      // Kết nối WebSocket
      connectWebSocket(
        user.username,
        () => console.log("✅ [Doctor] WebSocket connected"),
        null, // Không đăng ký handler cho tin nhắn tại đây
        (err) => console.error("❌ WebSocket error (doctor):", err)
      );
      
      // Đăng ký handler cho tin nhắn riêng biệt
      console.log("🔌 Đăng ký message handler trong DoctorChatPage");
      registerMessageHandler(handleMessage);
    }
    return () => disconnectWebSocket();
  }, [user?.username]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingPatients(true);
        // Use getPaidChatPatients instead of getAcceptedChatPatients
        const response = await getPaidChatPatients();
        if (response && response.result) {
          console.log("Paid patients data:", response.result);
          // Ensure each patient has a unique ID
          const patientsWithUniqueIds = response.result.map(patient => ({
            ...patient,
            // Generate a unique ID if patientId is missing
            uniqueId: patient.patientId || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }));
          setPatients(patientsWithUniqueIds);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách bệnh nhân:", err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
    
    // Refresh the patients list every 30 seconds
    const intervalId = setInterval(fetchPatients, 30000);
    
    // Listen for custom refreshPaidPatients event
    const handleRefreshEvent = () => {
      console.log("🔄 Refreshing paid patients list due to new payment");
      fetchPatients();
      setHasNewChatRequests(true);
    };
    
    window.addEventListener('refreshPaidPatients', handleRefreshEvent);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('refreshPaidPatients', handleRefreshEvent);
    };
  }, [user?.id]);

  const handlePatientSelect = async (patient) => {
    if (!user?.id) return;
    
    setLoading(true);
    
    // Create a properly formatted selectedUser object with all necessary fields
    const formattedPatient = {
      patientId: patient.patientId,
      patientName: patient.patientName,
      patientAvatar: patient.patientAvatar,
      requestId: patient.requestId,
      uniqueId: patient.uniqueId || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log("Selected patient:", patient);
    console.log("Formatted patient object:", formattedPatient);
    
    setSelectedUser(formattedPatient);
    
    try {
      console.log("Doctor ID:", user.id);
      console.log("Patient ID:", patient.patientId);
      
      const conversation = await getConversation(user.id, patient.patientId);
      
      // Ensure each message has a unique ID
      const messagesWithIds = Array.isArray(conversation) ? conversation.map((msg, index) => {
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
      console.error("❌ Lỗi lấy tin nhắn:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Patient List */}
      <div className="w-1/4 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Bệnh nhân đã thanh toán</h2>
        </div>
        
        {hasNewChatRequests && (
          <div className="p-3 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center text-yellow-800">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
              <p className="text-sm">Bạn có yêu cầu tư vấn mới. Kiểm tra thông báo.</p>
            </div>
          </div>
        )}
        
        {loadingPatients ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Không có bệnh nhân nào đã thanh toán
          </div>
        ) : (
          <div>
            {patients.map((patient) => (
              <div
                key={patient.uniqueId || patient.patientId}
                className={`flex items-center p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedUser?.patientId === patient.patientId
                    ? "bg-blue-50"
                    : ""
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                <img
                  src={patient.patientAvatar || "https://via.placeholder.com/40"}
                  alt={patient.patientName}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium">{patient.patientName}</p>
                  <p className="text-xs text-gray-500">
                    {patient.lastMessage || "Bắt đầu trò chuyện"}
                  </p>
                </div>
                {patient.unreadCount > 0 && (
                  <div className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {patient.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <ChatContainer />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-xl text-gray-500 mb-2">Chọn một bệnh nhân để bắt đầu trò chuyện</p>
              <p className="text-sm text-gray-400">Hoặc chờ thông báo khi có người muốn trò chuyện với bạn</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorChatPage() {
  return <DoctorChatLayout />;
}
