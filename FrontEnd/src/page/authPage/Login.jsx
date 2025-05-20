import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/localStorageService";
import { FaEnvelope, FaLock, FaGoogle, FaCamera, FaUserCircle, FaChevronRight } from "react-icons/fa";
import { HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineHeart, HiOutlineFingerPrint } from "react-icons/hi";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setError(null);
    setLoading(true);
    
    try {
      const token = await handleLogin(username, password);
      if (token) {
        login(token); // cập nhật context
        
        // Animation before redirect
        setTimeout(() => {
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
        }, 500);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-10">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 mb-4">
              <HiOutlineLightningBolt className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-500 mb-2">
              Student Stress Helper
            </h1>
            <p className="text-gray-600">
              Empowering students, reducing stress, unlocking potential
            </p>
          </div>

          {/* Login Method Selector */}
          <div className="flex justify-center space-x-3 mb-8">
            <button
              onClick={() => setLoginMethod("password")}
              className={`flex items-center px-5 py-2.5 rounded-xl transition-all duration-200 ${
                loginMethod === "password" 
                  ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md" 
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaLock className={`mr-2 ${loginMethod === "password" ? "" : "text-indigo-500"}`} />
              Password
            </button>
            <button
              onClick={() => setLoginMethod("face")}
              className={`flex items-center px-5 py-2.5 rounded-xl transition-all duration-200 ${
                loginMethod === "face" 
                  ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md" 
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FaCamera className={`mr-2 ${loginMethod === "face" ? "" : "text-indigo-500"}`} />
              Face ID
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loginMethod === "password" ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3.5 pl-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none shadow-sm transition-all"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500">
                  <FaEnvelope />
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full p-3.5 pl-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none shadow-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500">
                  <FaLock />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white p-3.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Log in <FaChevronRight className="ml-2" size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3.5 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500">
                  <FaEnvelope />
                </div>
              </div>
              <div className="flex justify-center items-center py-4">
                <HiOutlineFingerPrint className="text-indigo-500 text-5xl mb-2" />
              </div>
              <FaceLogin username={username} />
              <p className="text-center text-sm text-gray-500 mt-2">
                Position your face in front of the camera
              </p>
            </div>
          )}

          <div className="my-6 flex items-center">
            <hr className="flex-grow border-gray-200" />
            <span className="px-4 text-gray-500 text-sm">OR CONTINUE WITH</span>
            <hr className="flex-grow border-gray-200" />
          </div>

          <button
            onClick={handleContinueWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 p-3.5 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm"
          >
            <FaGoogle className="text-red-500" />
            Log in with Google
          </button>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-10 flex items-center justify-center text-xs text-gray-500">
            <HiOutlineShieldCheck className="mr-1 text-green-500" />
            Secured with end-to-end encryption
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900 bg-opacity-10 backdrop-blur-sm z-10"></div>
        <img
          src={loginImage}
          alt="Login Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-12">
          <div>
            <div className="flex items-center space-x-2">
              <HiOutlineHeart className="text-white text-3xl" />
              <h2 className="text-white text-2xl font-bold">MindWell</h2>
            </div>
          </div>
          
          <div className="max-w-md">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 shadow-xl">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-white text-lg font-medium leading-relaxed mb-4">
                "The Student Stress Helper Platform transformed my academic life. With its personalized guidance, I've developed healthier study habits and a balanced mindset."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <FaUserCircle className="text-white text-2xl" />
                </div>
                <div>
                  <p className="text-white font-medium">Nguyễn Minh An</p>
                  <p className="text-white text-sm opacity-75">High School Senior</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <div className="h-2 w-8 bg-white rounded-full opacity-100"></div>
              <div className="h-2 w-2 bg-white rounded-full opacity-50"></div>
              <div className="h-2 w-2 bg-white rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add animation keyframes for the login button */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}