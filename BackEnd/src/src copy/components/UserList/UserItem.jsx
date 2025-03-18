import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { formatDate } from '../../utils/dateUtils';

const UserItem = ({ user, lastMessage, unreadCount }) => {
  const { selectedUser, setSelectedUser } = useChat();
  
  const isSelected = selectedUser && selectedUser.id === user.id;

  const handleClick = () => {
    setSelectedUser(user);
  };

  return (
    <div 
      className={`
        p-3 flex items-center cursor-pointer hover:bg-gray-100
        ${isSelected ? 'bg-blue-50' : ''}
        ${unreadCount > 0 ? 'font-semibold' : ''}
      `}
      onClick={handleClick}
    >
      <div className="relative h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.username}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-700 text-xl font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </span>
        )}
        
        {user.online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>
      
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <span className="font-medium">{user.username}</span>
          {lastMessage && (
            <span className="text-xs text-gray-500">
              {formatDate(lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="flex justify-between mt-1">
          <p className="text-sm text-gray-600 truncate max-w-[180px]">
            {lastMessage ? lastMessage.content : 'No messages yet'}
          </p>
          
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 bg-blue-600 text-white rounded-full text-xs">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserItem;