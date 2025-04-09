import React, { useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getUnreadMessages } from "../../lib/util/chatServices"; // Cần tạo API call này

const MessageList = () => {
  const { messages, selectedUser, setMessages } = useChat();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user?.id || !selectedUser) return;
      setLoading(true);
      try {
        const res = await getUnreadMessages(user.id);
        const filteredMessages = res.result.filter(
          (msg) =>
            msg.senderId === selectedUser.doctorId ||
            msg.senderId === selectedUser.patientId
        );
        setMessages(filteredMessages);
      } catch (err) {
        console.error("Lỗi khi lấy tin nhắn chưa đọc:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnread();
  }, [user?.id, selectedUser, setMessages]);

  return (
    <div className="overflow-y-auto h-full p-4">
      {loading ? (
        <p className="text-gray-500 text-center">Đang tải tin nhắn...</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500 text-center">Chưa có tin nhắn nào</p>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow ${
                msg.senderId === user.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;
