import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, setToken } from "../../services/localStorageService";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import loginImage from "../../assets/1.png";
import { Link } from "react-router-dom";
import { handleLogin, handleContinueWithGoogle } from "../../lib/auth/authServices"; // Import hàm từ authService.js

export default function Login() {
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (getToken()) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin(username, password, setToken, navigate);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">
            Student Stress Helper ✨
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Empowering students, reducing stress, and unlocking potential – Your
            journey to a healthier mind starts here!
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <input
                type="username"
                placeholder="Enter your email"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-900 transition"
            >
              Log in
            </button>
          </form>

          {/* OR Separator */}
          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleContinueWithGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-black p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            Log in with Google
          </button>

          {/* Đổi vị trí link */}
          <p className="text-center text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 p-6 rounded-lg">
        <div className="relative w-full h-full">
          <img
            src={loginImage}
            alt="Login Illustration"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-semibold">
              "The Student Stress Helper Platform transformed the way I manage
              stress. Thanks to its guidance, I now navigate my studies with
              confidence and a healthier mindset."
            </p>
            <p className="mt-2 text-sm">Nguyễn Minh An</p>
            <p className="text-sm opacity-75">Student - High School Senior</p>
          </div>
        </div>
      </div>
    </div>
  );
}
