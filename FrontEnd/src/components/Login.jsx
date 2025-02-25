import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, setToken } from "../services/localStorageService";
import { OAuthConfig } from "../configurations/configuration";
import { FaUser, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa"; // Import icons
import loginImage from "../assets/1.png"; // Import hình ảnh đúng cách

export default function Login() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleContinueWithGoogle = () => {
    const targetUrl = `${OAuthConfig.authUri}?redirect_uri=${encodeURIComponent(OAuthConfig.redirectUri)}&response_type=code&client_id=${OAuthConfig.clientId}&scope=openid%20email%20profile`;
    window.location.href = targetUrl;
  };

  useEffect(() => {
    if (getToken()) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    const response = await fetch(`http://localhost:8080/identity/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setToken(data.result?.token);
    navigate("/");
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
          
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Full Name
            <div className="relative">
              <input
                type="text"
                placeholder="Full name"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div> */}

            {/* Email */}
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

            {/* Sign up button */}
            <button type="submit" className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-900 transition">
              Sign up
            </button>
          </form>

          {/* OR Separator */}
          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Sign up */}
          <button
            onClick={handleContinueWithGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-black p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            Sign up with Google
          </button>

          {/* Already have an account */}
          <p className="text-center text-gray-500 mt-4">
            Already have an account? <a href="#" className="text-blue-600 hover:underline">Log in</a>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 bg-gray-100 p-6 rounded-lg">
        <div className="relative w-full h-full">
          <img src={loginImage} alt="Login Illustration" className="w-full h-full object-cover rounded-lg" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-lg font-semibold">"The Student Stress Helper Platform transformed the way I manage stress. Thanks to its guidance, I now navigate my studies with confidence and a healthier mindset."</p>
            <p className="mt-2 text-sm">Nguyễn Minh An</p>
            <p className="text-sm opacity-75">Student - High School Senior</p>
          </div>
        </div>
      </div>
    </div>
  );
}
