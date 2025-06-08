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

  if (questions.length === 0) return <p className="text-center p-8">No questions available.</p>;

  const current = questions[currentIndex];
  const alreadyAnswered = answeredMap[current.id];
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left - Bot image */}
      <div className="w-full lg:w-1/2 bg-[#9BB168] flex items-center justify-center py-8 lg:py-0">
        <img src={Bot} alt="Bot" className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64" />
      </div>

      {/* Right - Question + options */}
      <div className="w-full lg:w-1/2 bg-yellow-100 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-8 lg:py-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-brown-700 mb-6 sm:mb-8">
          {current.content} ({currentIndex + 1}/{questions.length})
        </h2>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {current.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isDisabled = alreadyAnswered && !isSelected;
            return (
              <label
                key={idx}
                className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-3 rounded-lg sm:rounded-full border transition-all cursor-pointer min-h-[56px] ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg active:scale-[0.98]"
                } ${
                  isSelected ? "bg-[#9BB168] text-white border-[#9BB168]" : "bg-white border-gray-200 hover:border-[#9BB168]"
                }`}
                onClick={() => !alreadyAnswered && setSelectedOption(idx)}
              >
                <span className="text-sm sm:text-base font-medium flex-1 pr-4">{opt}</span>
                <input
                  type="radio"
                  name="answer"
                  checked={isSelected}
                  onChange={() => setSelectedOption(idx)}
                  className="hidden"
                  disabled={alreadyAnswered}
                />
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex-shrink-0 ${
                    isSelected ? "bg-white border-white" : "border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-full h-full rounded-full bg-[#9BB168] transform scale-75"></div>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">          <span className="text-sm sm:text-base text-black font-medium">
            Question {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-brown-700 hover:bg-brown-800 active:bg-brown-900 text-white py-3 sm:py-2 px-8 sm:px-6 rounded-full shadow-md transition-all transform hover:scale-105 active:scale-95 font-semibold min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedOption === null}
          >
            {currentIndex + 1 === questions.length ? "Complete" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}