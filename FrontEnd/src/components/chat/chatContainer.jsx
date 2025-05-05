import React from "react";
import ChatHeader from "./chatHeader"; // bạn tự tạo component này nếu cần
import MessageList from "./messageList"; // bạn tự tạo component này nếu cần
import ChatInput from "./chatInput"; // bạn tự tạo component này nếu cần
import { useChat } from "../../context/ChatContext";

const ChatContainer = () => {
  const { selectedUser } = useChat();

  if (!selectedUser) {
    return <div className="flex items-center justify-center h-full">Chọn đoạn đối thoại để bắt đầu trò chuyện.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatContainer;
