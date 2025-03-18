import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';

// Components
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import MainLayout from './components/Layout/MainLayout';
import ChatContainer from './components/Chat/ChatContainer';
import UserList from './components/UserList/UserList';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/chat" replace />} />
              <Route path="chat" element={
                <div className="h-full flex">
                  <div className="w-1/3 border-r border-gray-200 h-full">
                    <UserList />
                  </div>
                  <div className="w-2/3 h-full">
                    <ChatContainer />
                  </div>
                </div>
              } />
              <Route path="profile" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
                  <p>Profile settings will be implemented here.</p>
                </div>
              } />
              <Route path="settings" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Settings Page</h1>
                  <p>Application settings will be implemented here.</p>
                </div>
              } />
            </Route>
            
            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;