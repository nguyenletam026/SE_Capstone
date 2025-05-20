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

    let receiverId;
    if (selectedUser.patientId && user.id === selectedUser.patientId) {
      receiverId = selectedUser.doctorId;
    } else if (selectedUser.doctorId && user.id === selectedUser.doctorId) {
      receiverId = selectedUser.patientId;
    } else {
      receiverId = selectedUser.patientId || selectedUser.doctorId;
      if (receiverId === user.id) {
        console.error("Cannot send message to yourself");
        return;
      }
    }

    const message = {
      content: input,
      senderId: user.id,
      receiverId: receiverId,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending message:", message);
    sendMessage(message);
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSend}
      className="relative z-10 p-6 bg-gradient-to-br from-[#f8fbff] via-[#eaf6ff] to-[#d8e7ff] border-t border-blue-100 shadow-2xl"
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Shadowed, glassy input with floating label */}
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="peer w-full px-5 py-4 rounded-2xl shadow-lg bg-white/50 border border-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base text-blue-900 placeholder-transparent transition-all"
            placeholder=" "
            id="modern-chat-input"
            autoComplete="off"
          />
          <label
            htmlFor="modern-chat-input"
            className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 text-base pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-blue-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 bg-white/50 px-1 rounded"
          >
            Nhập tin nhắn...
          </label>
          {/* Animated send icon inside input */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none animate-pulse">
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <path d="M3 20v-7l18-5-18-5v7z" fill="currentColor" />
            </svg>
          </span>
        </div>
        {/* Neo-morphism send button with glow */}
        <button
          type="submit"
          className="flex items-center px-6 py-4 bg-gradient-to-tr from-blue-500 via-cyan-400 to-sky-400 rounded-2xl shadow-xl text-white font-semibold text-lg tracking-wide hover:scale-105 hover:shadow-blue-300/60 hover:from-blue-600 hover:to-cyan-500 active:scale-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span className="mr-2">Gửi</span>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M3 20v-7l18-5-18-5v7z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ChatInput;