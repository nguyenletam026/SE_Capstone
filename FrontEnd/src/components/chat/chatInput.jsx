import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { sendMessage } from "../../services/websocket";

const ChatInput = () => {
  const { user } = useAuth();
  const { selectedUser, setMessages } = useChat();
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || !user?.id) return;

    const receiverId = selectedUser?.doctorId || selectedUser?.patientId;

    const message = {
      content: input,
      senderId: user.id,
      receiverId: receiverId,
      timestamp: new Date().toISOString(),
    };

    sendMessage(message);
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  return (
    <form onSubmit={handleSend} className="p-4 border-t bg-white">
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg text-sm"
          placeholder="Nhập tin nhắn..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Gửi
        </button>
      </div>
    </form>
  );
};

export default ChatInput;