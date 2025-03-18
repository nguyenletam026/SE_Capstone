import React, { useRef, useEffect } from 'react';
import Message from './Message';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const MessageList = () => {
  const { currentUser } = useAuth();
  const { messages, loading } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <Message
              key={message.id || index}
              message={message}
              isOwn={message.senderId === currentUser?.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;