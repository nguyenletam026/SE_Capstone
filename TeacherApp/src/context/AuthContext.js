import React, { createContext, useState, useContext, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import { saveToken, saveUserData, getUserData, clearAuthData } from '../services/storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await teacherAPI.login(username, password);
      
      console.log('Login response:', JSON.stringify(response, null, 2));
      
      // Check if response has the expected structure
      const token = response?.result?.token || response?.token;
      const authenticated = response?.result?.authenticated || response?.authenticated;
      
      console.log('Extracted token:', token ? 'Found' : 'Not found');
      console.log('Authenticated:', authenticated);
      
      if (token && authenticated) {
        // Save token
        await saveToken(token);
        
        // Save user data
        const userData = {
          username: response.result?.username || response.username || username,
          fullName: response.result?.fullName || response.fullName || username,
          role: response.result?.role || response.role || 'TEACHER',
        };
        
        console.log('Saving user data:', userData);
        
        await saveUserData(userData);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        console.log('Login failed: Invalid credentials or response structure');
        return { success: false, message: 'Invalid login credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
