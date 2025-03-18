import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    // This should be handled by a route guard, but just in case
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;