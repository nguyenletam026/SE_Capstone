import React, { useState } from "react";

export default function HelpAndFeedback() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      alert("Vui lòng nhập phản hồi chi tiết hơn (ít nhất 10 ký tự).");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      alert("Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ phản hồi qua email nếu cần.");
      setMessage("");
      setEmail("");
      setCategory("general");
      setSubmitted(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-10">
        <h2 className="text-3xl font-bold text-brown-700 mb-4 text-center">Trợ Giúp & Góp Ý</h2>
        <p className="text-gray-600 text-center mb-8 text-sm">
          Bạn có gặp lỗi? Muốn đề xuất tính năng mới? Gửi phản hồi giúp chúng tôi hoàn thiện nền tảng hơn nhé!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email của bạn (tùy chọn)</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BB168]"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại phản hồi</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BB168]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">Góp ý chung</option>
              <option value="bug">Báo lỗi</option>
              <option value="feature">Đề xuất tính năng</option>
              <option value="question">Câu hỏi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung phản hồi</label>
            <textarea
              className="w-full h-44 border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#9BB168]"
              placeholder="Nhập phản hồi hoặc câu hỏi của bạn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitted}
            className={`w-full bg-[#9BB168] text-white font-semibold py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg hover:bg-green-700 ${submitted && "opacity-50"}`}
          >
            {submitted ? "Đang gửi phản hồi..." : "Gửi phản hồi"}
          </button>
        </form>
      </div>
    </div>
  );
}
