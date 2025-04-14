import React, { useEffect, useState } from "react";
import { getAcceptedChatPatients } from "../../lib/doctor/doctorServices";
import { getConversation } from "../../lib/util/chatServices";
import { connectWebSocket, disconnectWebSocket } from "../../services/websocket";
import ChatContainer from "../../components/chat/chatContainer";
import { useAuth } from "../../context/AuthContext";
import { ChatProvider, useChat } from "../../context/ChatContext";
import { fetchUserInfo } from "../../lib/user/info";

export default function DoctorChatPage() {
  return (
    <ChatProvider>
      <DoctorChatLayout />
    </ChatProvider>
  );
}

function DoctorChatLayout() {
  const { user, setUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const { selectedUser, setSelectedUser, setMessages, setLoading } = useChat();

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
          const parsed = JSON.parse(msg.body);
          setMessages((prev) => [...prev, parsed]);
        },
        (err) => console.error("❌ WebSocket error (doctor):", err)
      );
    }
    return () => disconnectWebSocket();
  }, [user?.username, setMessages]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getAcceptedChatPatients();
        if (res && res.result) {
          setPatients(res.result);
        } else {
          console.error("No patients found in response");
          setPatients([]);
        }
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách bệnh nhân:", err);
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  const handleSelect = async (patient) => {
    if (!user?.id) return;
    setSelectedUser(patient);
    setLoading(true);
    try {
      const convo = await getConversation(user.id, patient.patientId);
      console.log(user.id, patient.patientId);
      // Map lại để đồng bộ cấu trúc tin nhắn hiển thị
      if (convo && convo.result) {
        const formatted = convo.result.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderAvatar: msg.senderAvatar,
          timestamp: msg.timestamp,
        }));
        setMessages(formatted);
      } else {
        console.log("No conversation data found");
        setMessages([]);
      }
    } catch (err) {
      console.error("❌ Lỗi tải cuộc trò chuyện:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="w-64 bg-white border-r overflow-y-auto">
        <h3 className="text-lg font-bold text-center py-4 border-b">Bệnh nhân</h3>
        <ul>
          {patients && patients.length > 0 ? (
            patients.map((p) => (
              <li
                key={p.patientId}
                onClick={() => handleSelect(p)}
                className={`px-4 py-3 cursor-pointer hover:bg-blue-100 transition ${
                  selectedUser?.patientId === p.patientId ? "bg-blue-200 font-semibold" : ""
                }`}
              >
                <div className="flex items-center gap-3 text-black">
                  <img
                    src={p.patientAvatar || "https://via.placeholder.com/150"}
                    alt={p.patientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm">{p.patientName}</p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500 text-center">Không có bệnh nhân nào</li>
          )}
        </ul>
      </aside>

      <div className="flex-1">
        <ChatContainer />
      </div>
    </div>
  );
}
