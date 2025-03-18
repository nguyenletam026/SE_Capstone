import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
      <div className="p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
          {currentUser.avatarUrl ? (
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white text-xl font-semibold">
              {currentUser.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-semibold">{currentUser.username}</h2>
          <p className="text-xs text-gray-300">Online</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2">
          <Link
            to="/chat"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
              isActive('/chat') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <span>Messages</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
              isActive('/profile') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>Profile</span>
          </Link>
          
          <Link
            to="/settings"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
              isActive('/settings') ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Settings</span>
          </Link>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;