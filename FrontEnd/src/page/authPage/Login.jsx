// 📁 page/authPage/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/localStorageService";
import { FaEnvelope, FaLock, FaGoogle, FaCamera } from "react-icons/fa";
import loginImage from "../../assets/1.png";
import { Link } from "react-router-dom";
import { handleLogin, handleContinueWithGoogle } from "../../lib/auth/authServices";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import FaceLogin from "../../components/FaceLogin";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState("password");

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.scope === "ROLE_ADMIN") navigate("/admin-dashboard");
      else if (decoded.scope === "ROLE_DOCTOR") navigate("/doctor-home");
      else if (decoded.scope === "ROLE_TEACHER") navigate("/teacher-home");
      else navigate("/home");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = await handleLogin(username, password);
    if (token) {
      login(token); // cập nhật context
      const decoded = jwtDecode(token);
      if (decoded.scope === "ROLE_ADMIN") {
        navigate("/admin-dashboard");
      } else if (decoded.scope === "ROLE_DOCTOR") {
        navigate("/doctor-home");
      } else if (decoded.scope === "ROLE_TEACHER") {
        navigate("/teacher-home");
      } else {
        navigate("/home");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">Student Stress Helper ✨</h1>
          <p className="text-center text-gray-500 mb-6">
            Empowering students, reducing stress, and unlocking potential – Your journey to a healthier mind starts here!
          </p>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setLoginMethod("password")}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                loginMethod === "password" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              <FaLock className="mr-2" />
              Password
            </button>
            <button
              onClick={() => setLoginMethod("face")}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                loginMethod === "face" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              <FaCamera className="mr-2" />
              Face ID
            </button>
          </div>

          {loginMethod === "password" ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
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

              <button type="submit" className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-900 transition">
                Log in
              </button>
            </form>
          ) : (
            <div className="space-y-4">
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
              <FaceLogin username={username} />
            </div>
          )}

          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button
            onClick={handleContinueWithGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-black p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            Log in with Google
          </button>

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
              "The Student Stress Helper Platform transformed the way I manage stress. Thanks to its guidance, I now navigate my studies with confidence and a healthier mindset."
            </p>
            <p className="mt-2 text-sm">Nguyễn Minh An</p>
            <p className="text-sm opacity-75">Student - High School Senior</p>
          </div>
        </div>
      </div>
    </div>
  );
}
