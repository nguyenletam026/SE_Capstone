import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bot from "../../assets/4.png";
import { getMyAnswers } from "../../lib/user/assessmentServices";

export default function StartAssessment() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkIfAlreadyAnsweredToday = async () => {
      try {
        const res = await getMyAnswers();
        if (res.code === 200 && Array.isArray(res.result)) {
          const today = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
  
          const todayEntry = res.result.find((entry) => {
            const entryDate = new Date(entry.date).toLocaleDateString("sv-SE");
            return entryDate === today && entry.completed;
          });
  
          if (todayEntry) {
            navigate("/assessment/result");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check answers:", err);
      } finally {
        setChecking(false);
      }
    };
  
    checkIfAlreadyAnsweredToday();
  }, [navigate]);
  

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brown-700"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="w-full lg:w-1/2 bg-[#9BB168] flex items-center justify-center py-8 lg:py-0">
        <img src={Bot} alt="Bot" className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64" />
      </div>

      <div className="w-full lg:w-1/2 bg-yellow-100 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-8 lg:py-0">
        <h2 className="text-xl sm:text-2xl font-bold text-brown-700 mb-4">
          Đánh Giá Sức Khoẻ Hằng Ngày
        </h2>
        <p className="mb-8 text-gray-700 text-sm sm:text-base">
          Đây là một bảng khảo sát nhanh về tình trạng tinh thần hiện tại của bạn.
        </p>

        <button
          onClick={() => navigate("/assessment/step")}
          className="w-full sm:w-auto border border-black text-black font-semibold py-4 px-8 rounded-full hover:bg-black hover:text-white active:bg-gray-800 transition-colors text-base min-h-[48px]"
        >
          Bắt đầu
        </button>
      </div>
    </div>
  );
}