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
      
      // Check if message already exists in the state to prevent duplicates
      setMessages((prev) => {
        // If the message with the same ID already exists, don't add it again
        if (prev.some(m => m.id === parsed.id)) {
          return prev;
        }
        
        // For messages without IDs but with the same content and timestamp within 3 seconds,
        // consider them duplicates
        const threeSecondsAgo = new Date(parsed.timestamp).getTime() - 3000;
        if (prev.some(m => 
          m.content === parsed.content && 
          m.senderId === parsed.senderId && 
          new Date(m.timestamp).getTime() > threeSecondsAgo
        )) {
          return prev;
        }
        
        // Otherwise, add the new message
        return [...prev, parsed];
      });
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
    
    // Refresh the patients list every 2 minutes instead of 30 seconds
    // This reduces the frequency of refreshes that might be distracting
    const intervalId = setInterval(fetchPatients, 120000);
    
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
      
      // Update the patients list to reset the unread count for the selected patient
      setPatients(prevPatients => 
        prevPatients.map(p => 
          p.patientId === patient.patientId 
            ? { ...p, unreadCount: 0 } 
            : p
        )
      );
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
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Bệnh nhân đã thanh toán
          </h2>
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
          <div className="p-6 text-center">
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-blue-900 font-medium">Không có bệnh nhân nào đã thanh toán</p>
              <p className="text-blue-700 text-sm mt-1">Bệnh nhân sẽ xuất hiện ở đây sau khi họ thanh toán</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {patients.map((patient) => (
              <div
                key={patient.uniqueId || patient.patientId}
                className={`flex items-center p-4 cursor-pointer transition-all hover:bg-blue-50 ${
                  selectedUser?.patientId === patient.patientId
                    ? "bg-blue-100 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="relative">
                  <img
                    src={patient.patientAvatar || "https://via.placeholder.com/40"}
                    alt={patient.patientName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  />
                  {patient.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800">{patient.patientName}</p>
                    <p className="text-xs text-gray-500">
                      {patient.lastMessageTime ? new Date(patient.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate w-40">
                    {patient.lastMessage || "Bắt đầu trò chuyện"}
                  </p>
                </div>
                {patient.unreadCount > 0 && (
                  <div className="ml-2 bg-blue-500 text-white rounded-full min-w-5 h-5 flex items-center justify-center text-xs px-1.5">
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
            <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xl text-gray-700 font-medium mb-2">Chọn một bệnh nhân để bắt đầu trò chuyện</p>
              <p className="text-sm text-gray-500 mb-6">Hoặc chờ thông báo khi có người muốn trò chuyện với bạn</p>
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                <p>Mẹo: Bệnh nhân đã thanh toán sẽ xuất hiện ở bên trái.</p>
              </div>
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
