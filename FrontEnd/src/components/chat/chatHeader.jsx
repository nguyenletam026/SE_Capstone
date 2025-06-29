import React from "react";
import { useChat } from "../../context/ChatContext";

const ChatHeader = () => {
  const { selectedUser, messages } = useChat();

  if (!selectedUser) {
    return (
      <div className="p-4 bg-white border-b text-gray-600 font-semibold">
        Chatting with: <span className="text-gray-400">No user selected</span>
      </div>
    );
  }

  // Determine the name based on available properties  let name = "Unknown";
  if (selectedUser.doctorName) {
    name = selectedUser.doctorName;
  } else if (selectedUser.patientName) {
    name = selectedUser.patientName;
  }
  
  console.log("Selected user in header:", selectedUser);
  console.log("Display name:", name);
  
  const isExpired = messages && messages.length > 0 && messages[0] && messages[0].expired;

  return (
    <div className="p-4 bg-white border-b">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-600 font-semibold">
            Chatting with: <span className="text-gray-900">{name}</span>
          </span>
        </div>
        
        {isExpired && (
          <span className="text-sm text-red-500 font-medium">
            Session expired
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
