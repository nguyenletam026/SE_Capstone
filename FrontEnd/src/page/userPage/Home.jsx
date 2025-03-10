import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/localStorageService";
import Header from "../../components/header/Header";
// import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) {
      navigate("/login", { replace: true });
      return; // 🛑 Ngăn chặn các request API nếu không có token
    }

    fetch(`${process.env.REACT_APP_API_URL}/users/myInfo`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserDetails(data.result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        navigate("/login", { replace: true });
      });
  }, []); // ✅ Chạy 1 lần khi component mount

  const Button = ({ children, onClick }) => (
    <button 
      className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
      onClick={onClick}
    >
      {children}
    </button>
  );
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <motion.div 
          className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing your data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <motion.div 
          className="bg-white p-8 shadow-lg rounded-xl max-w-md w-full text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {userDetails.username}!</h2>
          <p className="text-gray-600 mt-2">{`${userDetails.firstName} ${userDetails.lastName}`}</p>
          <p className="text-gray-500">{userDetails.dob}</p>
          
          <div className="mt-6">
          <Button onClick={() => console.log("Analyzing...")}>Analyze Stress Level</Button>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
