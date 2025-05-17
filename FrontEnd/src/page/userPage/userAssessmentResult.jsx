import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAnswers } from "../../lib/user/assessmentServices";
import Bot from "../../assets/4.png";

export default function AssessmentResult() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await getMyAnswers();
        if (res.code === 200 && res.result.length > 0) {
          setResult(res.result[0]);
        }
      } catch (err) {
        console.error("Error fetching result", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brown-700"></div>
      </div>
    );
  }

  if (!result) return <p className="text-center p-8">Không tìm thấy kết quả.</p>;

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-[#9BB168] flex flex-col items-center justify-center text-white text-center px-6">
        <img src={Bot} alt="Bot" className="w-56 h-56 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Kết Quả Đánh Giá</h2>
        <p className="text-lg mb-4">Trạng thái tổng thể của bạn hôm nay là:</p>
        <p className="text-2xl font-bold mb-2">{result.overallStressLevel}</p>
        <p className="text-lg mb-6">
          Điểm trung bình: {Math.round(result.averageStressScore)}
        </p>

        <button
          onClick={() => navigate("/assessment/recommend")}
          className="mt-4 bg-black text-brown-700 font-semibold py-2 px-6 rounded-full hover:bg-brown-800 hover:text-white transition"
        >
          Xem Gợi Ý →
        </button>
      </div>

      <div className="w-1/2 bg-yellow-100 p-10">
        <h3 className="text-2xl font-bold mb-6 text-brown-700">Chi Tiết Câu Trả Lời</h3>
        <ul className="space-y-6">
          {result.answers.map((ans, idx) => (
            <li
              key={ans.id}
              className="bg-white rounded-lg p-4 shadow border border-gray-200"
            >
              <p className="font-semibold text-gray-800 mb-2">
                {idx + 1}. {ans.questionContent}
              </p>
              <p className="text-sm text-green-700">
                Câu trả lời: <span className="font-medium">{ans.selectedOptionText}</span>
              </p>
              <p className="text-sm text-gray-600">
                Mức độ: <span className="font-medium">{ans.stressLevel}</span> - Điểm: {Math.round(ans.stressScore)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
