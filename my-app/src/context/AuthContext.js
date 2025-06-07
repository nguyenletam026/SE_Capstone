import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as apiService from '../services/apiService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        
        if (token && userData) {
          setToken(token);
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log('Error loading user data', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserFromStorage();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      
      if (response && response.token) {
        // Store token and user data
        await AsyncStorage.setItem('userToken', response.token);
        
        // Get user profile
        const userProfile = await apiService.getUserProfile(response.token);
        console.log(userProfile)
        // Check if user is a teacher
        if (userProfile.role.name !== 'TEACHER') {
          throw new Error('This app is only for teachers');
        }
        
        // Save user data
        await AsyncStorage.setItem('userData', JSON.stringify(userProfile));
        
        setToken(response.token);
        setUser(userProfile);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);