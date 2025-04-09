import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Bot from "../../assets/4.png";
import {
  getQuestions,
  getMyAnswers,
  submitAnswer,
} from "../../lib/user/assessmentServices";

export default function UserHealthAssessment() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answeredMap, setAnsweredMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionRes = await getQuestions();
        const answerRes = await getMyAnswers();

        if (questionRes.code === 1000) {
          const allQuestions = questionRes.result;

          const today = new Date().toISOString().split("T")[0];
          const todayAnswers = (answerRes.result?.[0]?.answers || []).filter((ans) =>
            ans.createdAt.startsWith(today)
          );

          const answerMap = {};
          todayAnswers.forEach((ans) => {
            answerMap[ans.questionId] = ans;
          });

          setAnsweredMap(answerMap);
          setQuestions(allQuestions);

          if (allQuestions.length > 0 && answerMap[allQuestions[0].id]) {
            const preSelectedIndex = answerMap[allQuestions[0].id].selectedOptionIndex;
            setSelectedOption(preSelectedIndex);
          }
        }
      } catch (err) {
        console.error("Error fetching questions/answers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    const current = questions[currentIndex];
    const alreadyAnswered = answeredMap[current.id];

    if (!alreadyAnswered) {
      try {
        await submitAnswer(current.id, selectedOption);
      } catch (err) {
        console.error("Error submitting answer", err);
      }
    }

    if (currentIndex + 1 < questions.length) {
      const next = questions[currentIndex + 1];
      const nextPreSelected = answeredMap[next.id]?.selectedOptionIndex ?? null;
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(nextPreSelected);
    } else {
      navigate("/assessment/result");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-100 w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-brown-700"></div>
      </div>
    );
  }

  if (questions.length === 0) return <p className="text-center p-8">Không có câu hỏi nào.</p>;

  const current = questions[currentIndex];
  const alreadyAnswered = answeredMap[current.id];

  return (
    <div className="flex min-h-screen">
      {/* Left - Bot image */}
      <div className="w-1/2 bg-[#9BB168] flex items-center justify-center">
        <img src={Bot} alt="Bot" className="w-64 h-64" />
      </div>

      {/* Right - Question + options */}
      <div className="w-1/2 bg-yellow-100 flex flex-col justify-center px-12">
        <h2 className="text-2xl font-bold text-brown-700 mb-8">
          {current.content} ({currentIndex + 1}/{questions.length})
        </h2>

        <div className="space-y-4 mb-8">
          {current.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isDisabled = alreadyAnswered && !isSelected;
            return (
              <label
                key={idx}
                className={`flex items-center justify-between px-4 py-3 rounded-full border transition-all cursor-pointer ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : "hover:shadow"
                } ${
                  isSelected ? "bg-[#9BB168] text-white" : "bg-white"
                }`}
                onClick={() => !alreadyAnswered && setSelectedOption(idx)}
              >
                <span>{opt}</span>
                <input
                  type="radio"
                  name="answer"
                  checked={isSelected}
                  onChange={() => setSelectedOption(idx)}
                  className="hidden"
                  disabled={alreadyAnswered}
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isSelected ? "bg-black border-white" : "border-gray-400"
                  }`}
                ></div>
              </label>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-black">
            Câu hỏi {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={handleSubmit}
            className="bg-brown-700 hover:bg-brown-800 text-black py-2 px-6 rounded-full shadow-md transition-transform transform hover:scale-105"
            disabled={selectedOption === null}
          >
            {currentIndex + 1 === questions.length ? "Hoàn tất" : "Tiếp tục →"}
          </button>
        </div>
      </div>
    </div>
  );
}