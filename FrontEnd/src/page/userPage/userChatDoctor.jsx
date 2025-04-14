import React, { useEffect, useState } from "react";
import { getAcceptedChatDoctor } from "../../lib/doctor/doctorServices";
import { getConversation } from "../../lib/util/chatServices";
import { connectWebSocket, disconnectWebSocket } from "../../services/websocket";
import ChatContainer from "../../components/chat/chatContainer";
import { useAuth } from "../../context/AuthContext";
import { ChatProvider, useChat } from "../../context/ChatContext";
import { fetchUserInfo } from "../../lib/user/info";
import { getAllDoctorRecommend } from "../../lib/user/assessmentServices"; // thêm hàm gợi ý bác sĩ

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
          const parsed = JSON.parse(msg.body);
          setMessages((prev) => [...prev, parsed]);
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
      try {
        const [acceptedRes, recommendRes] = await Promise.all([
          getAcceptedChatDoctor(),
          getAllDoctorRecommend(),
        ]);

        // Match accepted doctor IDs with full doctor info from recommendations
        const acceptedIds = acceptedRes.result.map((r) => r.doctorId);
        const detailed = recommendRes.result.filter((doc) => acceptedIds.includes(doc.id));

        setDoctors(
          detailed.map((d) => ({
            doctorId: d.id,
            doctorName: `${d.firstName} ${d.lastName}`,
            doctorAvatar: d.avtUrl,
          }))
        );
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách bác sĩ:", err);
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
      setMessages(convo.result || []);
    } catch (err) {
      console.error("❌ Lỗi tải cuộc trò chuyện:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="w-64 bg-white border-r overflow-y-auto">
        <h3 className="text-lg font-bold text-center py-4 border-b">Bác sĩ đã duyệt</h3>
        <ul>
          {doctors.map((doc) => (
            <li
              key={doc.doctorId}
              onClick={() => handleSelect(doc)}
              className={`px-4 py-3 cursor-pointer hover:bg-green-500 transition ${
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
      </aside>

      <div className="flex-1">
        <ChatContainer />
      </div>
    </div>
  );
}
