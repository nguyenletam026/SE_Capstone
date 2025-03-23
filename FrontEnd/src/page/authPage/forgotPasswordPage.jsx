import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import forgotPasswordImage from "../../assets/1.png"; // Dùng lại ảnh login
import { sendResetPasswordEmail } from "../../lib/auth/authServices"; // Hàm giả sử bạn có

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await sendResetPasswordEmail(email);
    if (result.success) {
      setMessage("📩 Reset link has been sent to your email.");
    } else {
      setMessage("❌ Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">
            Forgot Your Password?
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Enter your email address below and we’ll send you a link to reset your password.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email input */}
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-900 transition"
            >
              Send Reset Link
            </button>

            {message && (
              <p className="text-sm text-center text-blue-600 mt-2">{message}</p>
            )}
          </form>

          {/* Back to login */}
          <p className="text-center text-gray-500 mt-4">
            Remember your password?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Back to Login
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
              "Every password reset is a new beginning. You're just one step away from getting back on track."
            </p>
            <p className="mt-2 text-sm">Student Support Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
