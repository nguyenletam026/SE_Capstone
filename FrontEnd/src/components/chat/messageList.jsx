import React, { useEffect, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getConversation } from "../../lib/util/chatServices";

const MessageList = () => {
  const { messages, selectedUser, setMessages } = useChat();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id || !selectedUser) return;
      setLoading(true);
      try {
        const receiverId = selectedUser.doctorId || selectedUser.patientId;
        const res = await getConversation(user.id, receiverId);
        if (res && Array.isArray(res)) {
          setMessages(res);
        } else {
          console.error("Invalid conversation response format");
          setMessages([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedUser) {
      fetchMessages();
    }
  }, [user?.id, selectedUser, setMessages]);

  // Generate a unique key for each message
  const getUniqueKey = (msg, index) => {
    // Use message ID if available
    if (msg.id) return `msg-${msg.id}`;
    
    // Use timestamp if available
    if (msg.timestamp) return `time-${msg.timestamp}-${index}`;
    
    // Fallback to index with content hash
    const contentHash = msg.content ? 
      msg.content.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return `idx-${index}-${contentHash}`;
  };

  return (
    <div className="overflow-y-auto h-full p-4">
      {loading ? (
        <p className="text-gray-500 text-center">Đang tải tin nhắn...</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500 text-center">Chưa có tin nhắn nào</p>
      ) : (
        messages.map((msg, index) => {
          // Skip rendering messages with missing data
          if (!msg || !msg.senderId) {
            console.warn("Skipping invalid message:", msg);
            return null;
          }
          
          return (
            <div
              key={getUniqueKey(msg, index)}
              className={`mb-2 flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow ${
                  msg.senderId === user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Sent"
                    className="max-w-full rounded-lg mb-2"
                  />
                )}
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;
