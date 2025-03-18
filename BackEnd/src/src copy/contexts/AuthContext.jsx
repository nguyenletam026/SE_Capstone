import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, login, logout as logoutService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (localStorage.getItem('token')) {
          const user = await getCurrentUser();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const result = await login(username, password);
      setCurrentUser(await getCurrentUser());
      return result;
    } catch (error) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      throw error;
    }
  };

  const logout = () => {
    logoutService();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);