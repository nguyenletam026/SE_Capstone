// 📁 context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getToken, removeToken, setToken } from "../services/localStorageService";
import { fetchUserInfo } from "../lib/user/info"; // 👈 Thêm dòng này

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const scope = decoded.scope;
        const email = decoded.sub;

        // 🔁 Gọi API /myInfo để lấy id + avatar + tên
        const infoRes = await fetchUserInfo(); // 👈 Lấy từ API
        const { id, username, firstName, lastName, avtUrl } = infoRes.result;

        setUser({
          id,
          email: username,
          name: `${firstName} ${lastName}`,
          avatar: avtUrl,
          role: scope,
        });
      } catch (err) {
        console.error("Auth init failed:", err);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token) => {
    setToken(token);
    window.location.reload(); // Reload để chạy lại `useEffect` và fetch myInfo
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
