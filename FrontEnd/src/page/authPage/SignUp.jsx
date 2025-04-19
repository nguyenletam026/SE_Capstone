import React, { useState } from "react";
<<<<<<< HEAD
import { handleSignUp } from "../../lib/auth/authServices";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Bot from "../../assets/4.png";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    birthdayDate: "",
    avtFile: null,
  });
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avtFile") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, avtFile: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const result = await handleSignUp(formData);
      if (result) {
        toast.success("🎉 Account created successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error("❌ Failed to create account!");
      }
    } catch (error) {
      toast.error("❌ An error occurred during sign up!");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Left image side */}
      <div className="w-1/2 bg-gradient-to-br from-yellow-100 via-pink-200 to-purple-500 flex items-center justify-center">
        <img src={Bot} alt="signup-art" className="w-60 h-60 object-contain" />
      </div>

      {/* Right form side */}
      <div className="w-1/2 bg-white flex items-center justify-center relative">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-8 rounded-xl shadow-md"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Create an Account
          </h2>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="text"
              name="username"
              placeholder="example@email.com"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="********"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Your first name"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Your last name"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Birthday */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthday
            </label>
            <input
              type="date"
              name="birthdayDate"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Avatar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Avatar
            </label>
            <input
              type="file"
              name="avtFile"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500"
            />
            {preview && (
              <img
                src={preview}
                alt="Avatar Preview"
                className="h-20 w-20 object-cover rounded-full mt-3 mx-auto"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full text-white p-2 rounded transition duration-200 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create an account"}
          </button>

          {/* Login Link */}
          <p className="text-sm text-center mt-4 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default SignUpForm;
=======
 import { handleSignUp } from "../../lib/auth/authServices";
 import { Link } from "react-router-dom";
 import { ToastContainer, toast } from "react-toastify";
 import "react-toastify/dist/ReactToastify.css";
 import { useNavigate } from "react-router-dom";
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
   const navigate = useNavigate();
 
   const [preview, setPreview] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
 
   const handleChange = (e) => {
     const { name, value, files } = e.target;
     if (name === "avtFile") {
       const file = files[0];
       setFormData((prev) => ({ ...prev, avtFile: file }));
       setPreview(URL.createObjectURL(file));
     } else {
       setFormData((prev) => ({ ...prev, [name]: value }));
     }
   };
 
   const handleSubmit = async (e) => {
     e.preventDefault();
     setIsLoading(true);
   
     try {
       const result = await handleSignUp(formData);
       if (result) {
         toast.success("🎉 Account created successfully!");
         setTimeout(() => {
           navigate("/login");
         }, 2000);
       } else {
         toast.error("❌ Failed to create account!");
       }
     } catch (error) {
       toast.error("❌ An error occurred during sign up!");
     } finally {
       setIsLoading(false);
     }
   };
   
 
   return (
     <div className="flex h-screen">
       {/* Left image side */}
       <div className="w-1/2 bg-gradient-to-br from-yellow-100 via-pink-200 to-purple-500 flex items-center justify-center">
         <img src={Bot} alt="signup-art" className="w-60 h-60 object-contain" />
       </div>
 
       {/* Right form side */}
       <div className="w-1/2 bg-white flex items-center justify-center relative">
         <form
           onSubmit={handleSubmit}
           className="w-full max-w-md p-8 rounded-xl shadow-md"
         >
           <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
             Create an Account
           </h2>
 
           {/* Username */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Email Address
             </label>
             <input
               type="text"
               name="username"
               placeholder="example@email.com"
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
               required
             />
           </div>
 
           {/* Password */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Password
             </label>
             <input
               type="password"
               name="password"
               placeholder="********"
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
               required
             />
           </div>
 
           {/* First Name */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               First Name
             </label>
             <input
               type="text"
               name="firstName"
               placeholder="Your first name"
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
             />
           </div>
 
           {/* Last Name */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Last Name
             </label>
             <input
               type="text"
               name="lastName"
               placeholder="Your last name"
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
             />
           </div>
 
           {/* Birthday */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Birthday
             </label>
             <input
               type="date"
               name="birthdayDate"
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
             />
           </div>
 
           {/* Avatar */}
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Upload Avatar
             </label>
             <input
               type="file"
               name="avtFile"
               accept="image/*"
               onChange={handleChange}
               className="block w-full text-sm text-gray-500"
             />
             {preview && (
               <img
                 src={preview}
                 alt="Avatar Preview"
                 className="h-20 w-20 object-cover rounded-full mt-3 mx-auto"
               />
             )}
           </div>
 
           {/* Submit Button */}
           <button
             type="submit"
             className={`w-full text-white p-2 rounded transition duration-200 ${
               isLoading
                 ? "bg-gray-400 cursor-not-allowed"
                 : "bg-green-500 hover:bg-green-600"
             }`}
             disabled={isLoading}
           >
             {isLoading ? "Creating account..." : "Create an account"}
           </button>
 
           {/* Login Link */}
           <p className="text-sm text-center mt-4 text-gray-600">
             Already have an account?{" "}
             <Link to="/login" className="text-blue-600 hover:underline">
               Log in
             </Link>
           </p>
         </form>
 
         <ToastContainer position="top-right" autoClose={3000} />
       </div>
     </div>
   );
 };
 
 export default SignUp;
>>>>>>> hieuDev
