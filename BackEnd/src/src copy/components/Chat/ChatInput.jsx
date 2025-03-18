import React, { useState, useRef } from 'react';
import { sendMessage, sendMessageWithImage } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();
  const { selectedUser, setMessages } = useChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !image) || !selectedUser || sending) return;

    try {
      setSending(true);
      let response;

      if (image) {
        response = await sendMessageWithImage(
          message.trim(),
          currentUser.id,
          selectedUser.id,
          image
        );
        setImage(null);
        setImagePreview('');
      } else {
        const messageObj = {
          content: message.trim(),
          senderId: currentUser.id,
          receiverId: selectedUser.id,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        response = await sendMessage(messageObj);
        
        // Add message to state optimistically for better UX
        setMessages(prev => [...prev, messageObj]);
      }
      
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-200 p-4 bg-white"
    >
      {imagePreview && (
        <div className="relative mb-2">
          <img 
            src={imagePreview} 
            alt="Selected" 
            className="h-20 rounded-lg"
          />
          <button 
            type="button"
            onClick={removeImage}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center">
        <button
          type="button"
          onClick={openFileSelector}
          className="p-2 text-gray-500 hover:text-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
          </svg>
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!selectedUser || sending}
        />
        
        <button
          type="submit"
          className={`bg-blue-600 text-white p-2 rounded-r-lg ${
            (!message.trim() && !image) || !selectedUser || sending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={(!message.trim() && !image) || !selectedUser || sending}
        >
          {sending ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;