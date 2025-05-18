import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import forgotPasswordImage from "../../assets/1.png"; // Dùng lại ảnh login
import { sendResetPasswordEmail } from "../../lib/auth/authServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      const result = await sendResetPasswordEmail(email);
      
      if (result.success) {
        setEmailSent(true);
        toast.success("Email đặt lại mật khẩu đã được gửi!");
        
        // Store email for potential resend
        localStorage.setItem("passwordResetEmail", email);
      } else {
        toast.error(result.message || "Không thể gửi email đặt lại mật khẩu.");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">
            Quên mật khẩu?
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
          </p>

          {emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Email đã gửi!</h3>
              <p className="text-green-700 mb-4">
                Chúng tôi đã gửi email đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
              >
                Gửi lại email
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email input */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-black text-white p-3 rounded-lg hover:bg-gray-900 transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
              </button>
            </form>
          )}

          {/* Back to login */}
          <p className="text-center text-gray-500 mt-4">
            Đã nhớ mật khẩu?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 p-6 rounded-lg">
        <div className="relative w-full h-full">
          <img
            src={forgotPasswordImage}
            alt="Forgot Password Illustration"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-semibold">
              "Mỗi lần đặt lại mật khẩu là một khởi đầu mới. Bạn chỉ còn một bước nữa để quay lại."
            </p>
            <p className="mt-2 text-sm">Đội ngũ hỗ trợ sinh viên</p>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
