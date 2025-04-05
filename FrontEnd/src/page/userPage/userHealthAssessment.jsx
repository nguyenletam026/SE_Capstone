import React, { useState } from "react";
import Bot from "../../assets/4.png"; // ảnh bot ở giữa

const mockQuestion = {
  id: 1,
  question: "Mục Tiêu Bạn Đến Với Chúng Tôi Là Gì ?",
  options: [
    "Tôi muốn giảm stress tức thì",
    "Tôi muốn được chỉ dẫn cụ thể",
    "Tôi có vấn đề về tâm lý từ trước",
    "...",
    "...",
  ],
};

export default function UserHealthAssessment() {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="flex min-h-screen">
      {/* Left section */}
      <div className="w-1/2 bg-[#9BB168] flex items-center justify-center">
        <img src={Bot} alt="Bot" className="w-64 h-64" />
      </div>

      {/* Right section */}
      <div className="w-1/2 bg-yellow-100 flex flex-col justify-center px-12">
        {/* Câu hỏi */}
        <h2 className="text-2xl font-bold text-brown-700 mb-8">
          {mockQuestion.question}
        </h2>

        <div className="space-y-4 mb-8">
          {mockQuestion.options.map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-center justify-between px-4 py-3 rounded-full border cursor-pointer transition-all ${
                selectedOption === idx ? "bg-[#9BB168] text-white" : "bg-white"
              }`}
              onClick={() => setSelectedOption(idx)}
            >
              <span>{opt}</span>
              <span>
                <input
                  type="radio"
                  name="answer"
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                  className="form-radio text-green-600 hidden"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedOption === idx
                      ? "bg-white border-white"
                      : "border-gray-400"
                  }`}
                ></div>
              </span>
            </label>
          ))}
        </div>

        {/* Submit + Số câu trả lời */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {mockQuestion.options.length} câu trả lời
          </span>

          <button
            className="bg-brown-700 hover:bg-brown-800 text-white py-2 px-6 rounded-full"
            disabled={selectedOption === null}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
