import React from 'react';
import { useChat } from '../../contexts/ChatContext';

const ChatHeader = () => {
  const { selectedUser } = useChat();

  if (!selectedUser) {
    return (
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-500">Select a conversation</h2>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center">
      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
        {selectedUser.avatarUrl ? (
          <img 
            src={selectedUser.avatarUrl} 
            alt={selectedUser.username}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-700 text-xl font-semibold">
            {selectedUser.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="ml-3">
        <h2 className="text-xl font-semibold">{selectedUser.username}</h2>
        <p className="text-sm text-gray-500">
          {selectedUser.online ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;