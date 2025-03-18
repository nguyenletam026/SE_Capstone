import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChat } from '../../contexts/ChatContext';

const ChatContainer = () => {
  const { selectedUser } = useChat();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ChatHeader />
      
      {selectedUser ? (
        <>
          <MessageList />
          <ChatInput />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-sm">
            <img 
              src="/logo192.png" 
              alt="Chat App Logo" 
              className="h-24 mx-auto mb-4 opacity-25"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500">
              Choose a contact from the list to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;