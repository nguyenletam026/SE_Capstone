import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getFaceAuthStatus, isAuthValid } from '../../lib/doctor/faceAuthService';
import { FaSpinner } from 'react-icons/fa';

/**
 * Component bảo vệ các route yêu cầu xác thực khuôn mặt
 * Chuyển hướng đến trang xác thực nếu người dùng chưa xác thực
 */
const FaceAuthGuard = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra trạng thái xác thực
    const checkAuthStatus = () => {
      // Kiểm tra xác thực cơ bản
      const hasVerified = getFaceAuthStatus();
      
      // Kiểm tra thời hạn xác thực (4 giờ)
      const isStillValid = isAuthValid();
      
      setIsAuthenticated(hasVerified && isStillValid);
      setChecking(false);
    };

    // Thêm delay ngắn để tránh nhấp nháy UI
    const timer = setTimeout(checkAuthStatus, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Hiển thị loading khi đang kiểm tra
  if (checking) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <FaSpinner className="text-blue-500 text-4xl animate-spin mb-4" />
        <p className="text-gray-600">Đang kiểm tra xác thực...</p>
      </div>
    );
  }

  // Nếu đã xác thực, hiển thị các route được bảo vệ
  if (isAuthenticated) {
    return children;
  }
  
  // Nếu chưa xác thực, chuyển hướng đến trang xác thực
  return (
    <Navigate 
      to="/face-auth" 
      state={{ from: location.pathname }} 
      replace 
    />
  );
};

export default FaceAuthGuard; 