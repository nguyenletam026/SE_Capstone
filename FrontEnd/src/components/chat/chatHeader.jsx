import React from "react";
import { useChat } from "../../context/ChatContext";

const ChatHeader = () => {
  const { selectedUser } = useChat();

  if (!selectedUser) {
    return (
      <div className="p-4 bg-white border-b text-blue-600 font-semibold">
        Đang trò chuyện với: <span className="text-gray-600">Chưa chọn người dùng</span>
      </div>
    );
  }

  const name = selectedUser.doctorName || selectedUser.patientName || "Không xác định";

  return (
    <div className="p-4 bg-white border-b text-blue-600 font-semibold">
      Đang trò chuyện với: <span className="text-gray-900">{name}</span>
    </div>
  );
};

export default ChatHeader;
