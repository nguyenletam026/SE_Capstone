import React, { useState, useEffect } from 'react';
import UserItem from './UserItem';
import { getAllUsers } from '../../services/userService';
import { getRecentMessages, getUnreadCount } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentMessages, setRecentMessages] = useState({});
  const { currentUser } = useAuth();
  const { unreadCounts } = useChat();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        // Filter out current user
        const filteredUsers = allUsers.filter(user => user.id !== currentUser.id);
        setUsers(filteredUsers);
        
        // Get recent messages and unread counts
        const messages = await getRecentMessages(currentUser.id);
        setRecentMessages(messages);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                lastMessage={recentMessages[user.id]}
                unreadCount={unreadCounts[user.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;