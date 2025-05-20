import React, { useState } from "react";
import { handleSignUp } from "../../lib/auth/authServices";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaUser, FaCalendarAlt, FaImage, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiOutlineArrowNarrowRight, HiOutlineShieldCheck } from "react-icons/hi";
import Bot from "../../assets/4.png";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    birthdayDate: "",
    avtFile: null,
  });
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avtFile") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, avtFile: file }));
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      // Validate first step
      if (!formData.username || !formData.password) {
        toast.warning("Please provide both email and password");
        return;
      }
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.username)) {
        toast.warning("Please enter a valid email address");
        return;
      }
      // Simple password validation (at least 8 characters)
      if (formData.password.length < 8) {
        toast.warning("Password must be at least 8 characters long");
        return;
      }
    }
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate second step
    if (!formData.firstName || !formData.lastName) {
      toast.warning("Please provide both first and last name");
      return;
    }
    if (!formData.birthdayDate) {
      toast.warning("Please select your birthday date");
      return;
    }

    setIsLoading(true);
    try {
      const result = await handleSignUp(formData);
      if (result) {
        toast.success("🎉 Account created successfully! Please verify your email.");
        setTimeout(() => navigate("/verify-email"), 2000);
      } else {
        toast.error("❌ Failed to create account!");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error(`❌ ${error.response?.data?.message || "An error occurred!"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* Left image side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative w-full h-full flex flex-col items-center justify-center p-12 text-white">
          <img 
            src={Bot} 
            alt="signup-art" 
            className="w-72 h-72 object-contain drop-shadow-2xl mb-8 animate-float"
          />
          <h1 className="text-4xl font-extrabold mb-4 text-center">Welcome to MindWell</h1>
          <p className="text-lg opacity-90 text-center max-w-md">
            Start your journey to better mental health and well-being today.
          </p>
          <div className="mt-12 flex space-x-3">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-lg">
              <p className="font-medium text-lg">24/7</p>
              <p className="text-sm opacity-80">Support</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-lg">
              <p className="font-medium text-lg">100+</p>
              <p className="text-sm opacity-80">Doctors</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-lg">
              <p className="font-medium text-lg">10K+</p>
              <p className="text-sm opacity-80">Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              {step === 1 ? "Create Your Account" : "Complete Your Profile"}
            </h2>
            <p className="text-gray-500 mt-2">
              {step === 1 
                ? "Enter your details to get started with MindWell" 
                : "Just a few more details to personalize your experience"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Account</span>
              <span>Profile</span>
            </div>
          </div>

          {step === 1 ? (
            /* Step 1: Email and Password */
            <form onSubmit={handleNextStep} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="username"
                    value={formData.username}
                    placeholder="you@example.com"
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Create Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    placeholder="Minimum 8 characters"
                    onChange={handleChange}
                    className="pl-10 pr-10 w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <HiOutlineShieldCheck className="mr-1" size={16} />
                  Your password is encrypted and secure
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg font-medium hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <HiOutlineArrowNarrowRight />
                </div>
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            /* Step 2: Personal Information */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name and Last Name in a grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      placeholder="John"
                      onChange={handleChange}
                      className="pl-10 w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      placeholder="Doe"
                      onChange={handleChange}
                      className="pl-10 w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Birthday</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="date"
                    name="birthdayDate"
                    value={formData.birthdayDate}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Profile Picture (Optional)</label>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`h-16 w-16 rounded-full ${preview ? 'border-2 border-indigo-500' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
                      {preview ? (
                        <img src={preview} alt="Avatar Preview" className="h-full w-full object-cover" />
                      ) : (
                        <FaUser className="text-gray-400 text-xl" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="flex cursor-pointer items-center justify-center gap-2 w-full p-2.5 border border-dashed border-gray-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition">
                      <FaImage />
                      <span className="text-sm font-medium">
                        {preview ? "Change Picture" : "Upload Picture"}
                      </span>
                      <input
                        type="file"
                        name="avtFile"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg font-medium hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaCheck />
                      <span>Create Account</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Terms & Privacy */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>{" "}
              and {" "}
              <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>

      {/* Add this to your CSS/style section */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SignUp;