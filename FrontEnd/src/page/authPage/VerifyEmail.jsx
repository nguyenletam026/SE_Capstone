import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    
    if (!token) {
      // If no token in URL, show pending verification screen
      setVerifying(false);
      setPendingVerification(true);
      return;
    }

    const verifyEmail = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
        const response = await axios.get(`${API_BASE}/api/verify/${token}`);
        
        console.log("Verification response:", response.data);
        
        // Check if the response is successful and contains a result field
        if (response.data && response.data.result === true) {
          setVerified(true);
          toast.success("Email đã được xác thực thành công!");
          
          // Remove the pending email from localStorage
          localStorage.removeItem("pendingVerificationEmail");
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError("Xác thực email thất bại. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError("Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại.");
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  const handleResendVerification = async () => {
    const email = localStorage.getItem("pendingVerificationEmail");
    
    if (!email) {
      toast.error("Không tìm thấy email để gửi lại mã xác thực");
      return;
    }
    
    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
      const response = await axios.post(`${API_BASE}/api/verify/resend`, { email });
      
      console.log("Resend verification response:", response.data);
      
      if (response.data && response.data.result) {
        toast.success("Đã gửi lại email xác thực!");
      } else {
        toast.error("Không thể gửi lại email xác thực. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      
      if (error.response?.data?.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error("Không thể gửi lại email xác thực. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-200 to-purple-500 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Xác thực Email
        </h2>

        {verifying ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Đang xác thực email của bạn...</p>
          </div>
        ) : pendingVerification ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg
                className="h-10 w-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Xác thực tài khoản của bạn
            </h3>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi một email xác thực đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để hoàn tất quá trình đăng ký.
            </p>
            <button
              onClick={handleResendVerification}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none mb-4"
            >
              Gửi lại email xác thực
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Quay lại đăng nhập
            </button>
          </div>
        ) : verified ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Xác thực thành công!
            </h3>
            <p className="text-gray-600 mb-6">
              Email của bạn đã được xác thực. Bạn sẽ được chuyển hướng đến trang đăng nhập.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Xác thực thất bại
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleResendVerification}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none mb-4"
            >
              Gửi lại email xác thực
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 