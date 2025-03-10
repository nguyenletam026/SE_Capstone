import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, removeToken } from "../services/localStorageService";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.sub,
          role: decoded.scope || decoded.roles || decoded.role || [],
        });
      } catch (error) {
        console.error("Invalid token", error);
        removeToken();
      }
    }
    setLoading(false);
  }, []); // ✅ Chỉ chạy một lần khi app khởi động

  const login = (token) => {
    setToken(token);
    const decoded = jwtDecode(token);
    setUser({
      username: decoded.sub,
      role: decoded.scope || decoded.roles || decoded.role || [],
    });
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
