import React, { useEffect, useState } from "react";
import { getAcceptedChatDoctor } from "../../lib/doctor/doctorServices";
import { getConversation, getActiveChatDoctors } from "../../lib/util/chatServices";
import { connectWebSocket, disconnectWebSocket } from "../../services/websocket";
import ChatContainer from "../../components/chat/chatContainer";
import { useAuth } from "../../context/AuthContext";
import { ChatProvider, useChat } from "../../context/ChatContext";
import { fetchUserInfo } from "../../lib/user/info";
import { getAllDoctorRecommend } from "../../lib/user/assessmentServices";

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
        const [activeDoctorsRes, recommendRes] = await Promise.all([
          getActiveChatDoctors(),
          getAllDoctorRecommend(),
        ]);

        // Match active chat doctors with full doctor info
        const activeDoctorIds = activeDoctorsRes.result.map((r) => r.doctorId);
        const detailed = recommendRes.result.filter((doc) => activeDoctorIds.includes(doc.id));

        setDoctors(
          detailed.map((d) => ({
            doctorId: d.id,
            doctorName: `${d.firstName} ${d.lastName}`,
            doctorAvatar: d.avtUrl,
            expiresAt: activeDoctorsRes.result.find(r => r.doctorId === d.id)?.expiresAt,
          }))
        );
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách bác sĩ:", err);
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
      setMessages(convo.result || []);
    } catch (err) {
      console.error("❌ Lỗi tải cuộc trò chuyện:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (expiresAt) => {
    if (!expiresAt) return "";
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return "Hết hạn";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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
        <h3 className="text-lg font-bold text-center py-4 border-b">Bác sĩ có thể chat</h3>
        {doctors.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Bạn chưa có bác sĩ nào để chat.</p>
            <p className="mt-2">
              <a href="/assessment/recommend" className="text-green-600 hover:underline">
                Chọn bác sĩ và thanh toán
              </a>
            </p>
          </div>
        ) : (
          <ul>
            {doctors.map((doc) => (
              <li
                key={doc.doctorId}
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
                    <p className="text-xs text-gray-500">
                      Còn lại: {formatTimeLeft(doc.expiresAt)}
                    </p>
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
