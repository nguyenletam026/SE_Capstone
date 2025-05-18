import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { verifyResetToken, resetPassword } from "../../lib/auth/authServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import resetPasswordImage from "../../assets/2.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract token from URL
  const token = new URLSearchParams(location.search).get("token");
  
  // Verify token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        toast.error("Không tìm thấy mã đặt lại mật khẩu");
        setVerifying(false);
        return;
      }
      
      try {
        const result = await verifyResetToken(token);
        if (result.success && result.isValid) {
          setTokenVerified(true);
        } else {
          toast.error("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        toast.error("Đã xảy ra lỗi khi kiểm tra mã đặt lại mật khẩu");
      } finally {
        setVerifying(false);
      }
    };
    
    checkToken();
  }, [token]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setResetComplete(true);
        toast.success("Mật khẩu đã được đặt lại thành công!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(result.message || "Không thể đặt lại mật khẩu");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (verifying) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang xác thực mã đặt lại mật khẩu...</p>
        </div>
      );
    }
    
    if (!tokenVerified) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Mã không hợp lệ</h3>
          <p className="text-red-700 mb-4">
            Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
          >
            Yêu cầu mã mới
          </button>
        </div>
      );
    }
    
    if (resetComplete) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-green-800 mb-2">Mật khẩu đã đặt lại!</h3>
          <p className="text-green-700 mb-4">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.
          </p>
          <button
  onClick={() => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  }}
  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
>
  Đăng nhập ngay
</button>

        </div>
      );
    }
    
    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* New Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu mới"
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu mới"
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-black text-white p-3 rounded-lg hover:bg-gray-900 transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </button>
      </form>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Nhập mật khẩu mới của bạn bên dưới
          </p>

          {renderContent()}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 p-6 rounded-lg">
        <div className="relative w-full h-full">
          <img
            src={resetPasswordImage}
            alt="Reset Password Illustration"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-semibold">
              "Bảo mật tài khoản của bạn là ưu tiên hàng đầu của chúng tôi. Hãy tạo một mật khẩu mạnh để bảo vệ thông tin của bạn."
            </p>
            <p className="mt-2 text-sm">Đội ngũ bảo mật</p>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
} 