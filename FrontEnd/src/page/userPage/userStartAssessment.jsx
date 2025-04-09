import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bot from "../../assets/4.png";
import { getMyAnswers } from "../../lib/user/assessmentServices";

export default function StartAssessment() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkIfAlreadyAnswered = async () => {
      try {
        const res = await getMyAnswers();
        if (res.code === 200 && res.result.length > 0) {
          const latest = res.result[res.result.length - 1];
          const today = new Date().toISOString().split("T")[0];
          const answerDate = new Date(latest.date).toISOString().split("T")[0];
          if (answerDate === today && latest.completed) {
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

    checkIfAlreadyAnswered();
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brown-700"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-[#9BB168] flex items-center justify-center">
        <img src={Bot} alt="Bot" className="w-64 h-64" />
      </div>

      <div className="w-1/2 bg-yellow-100 flex flex-col justify-center px-12">
        <h2 className="text-2xl font-bold text-brown-700 mb-4">
          Đánh Giá Sức Khoẻ Hằng Ngày
        </h2>
        <p className="mb-8 text-gray-700">
          Đây là một bảng khảo sát nhanh về tình trạng tinh thần hiện tại của bạn.
        </p>

        <button
          onClick={() => navigate("/assessment/step")}
          className="border border-black text-black font-semibold py-2 px-6 rounded-full hover:bg-black hover:text-white transition text-sm"
        >
          Bắt đầu
        </button>
      </div>
    </div>
  );
}
