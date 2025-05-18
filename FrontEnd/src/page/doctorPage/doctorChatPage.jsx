import React, { useEffect, useState } from "react";
import { getAcceptedChatPatients } from "../../lib/doctor/doctorServices";
import { getConversation } from "../../lib/util/chatServices";
import { connectWebSocket, disconnectWebSocket } from "../../services/websocket";
import ChatContainer from "../../components/chat/chatContainer";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { fetchUserInfo } from "../../lib/user/info";

function DoctorChatLayout() {
  const { user, setUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const { selectedUser, setSelectedUser, setMessages, setLoading } = useChat();
  const [loadingPatients, setLoadingPatients] = useState(true);

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

  useEffect(() => {
    if (user?.username) {
      connectWebSocket(
        user.username,
        () => console.log("✅ [Doctor] WebSocket connected"),
        (msg) => {
          try {
            const parsed = JSON.parse(msg.body);
            // Add a unique ID to the message if it doesn't have one
            if (!parsed.id) {
              parsed.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            setMessages((prev) => [...prev, parsed]);
          } catch (err) {
            console.error("❌ Failed to parse message:", err);
          }
        },
        (err) => console.error("❌ WebSocket error (doctor):", err)
      );
    }
    return () => disconnectWebSocket();
  }, [user?.username, setMessages]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingPatients(true);
        const response = await getAcceptedChatPatients();
        if (response && response.result) {
          console.log("Patients data:", response.result);
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
          <h2 className="text-lg font-semibold">Bệnh nhân</h2>
        </div>
        
        {loadingPatients ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Không có bệnh nhân nào
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
                <div>
                  <p className="font-medium">{patient.patientName}</p>
                  <p className="text-xs text-gray-500">
                    {patient.lastMessage || "Bắt đầu trò chuyện"}
                  </p>
                </div>
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
