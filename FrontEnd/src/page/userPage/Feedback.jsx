import React, { useState } from "react";

export default function HelpAndFeedback() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      alert("Please enter more detailed feedback (at least 10 characters).");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      alert("Thank you for your feedback! We will respond via email if needed.");
      setMessage("");
      setEmail("");
      setCategory("general");
      setSubmitted(false);
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-8 lg:p-10">        <h2 className="text-2xl sm:text-3xl font-bold text-brown-700 mb-3 sm:mb-4 text-center">Help & Feedback</h2>
        <p className="text-gray-600 text-center mb-6 sm:mb-8 text-xs sm:text-sm">
          Encountered an error? Want to suggest a new feature? Send us feedback to help us improve the platform!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Your email (optional)</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#9BB168] text-sm sm:text-base"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Feedback type</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#9BB168] text-sm sm:text-base"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">General feedback</option>
              <option value="bug">Report bug</option>
              <option value="feature">Feature suggestion</option>
              <option value="question">Question</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Feedback content</label>
            <textarea
              className="w-full h-32 sm:h-44 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#9BB168] text-sm sm:text-base"
              placeholder="Enter your feedback or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitted}
            className={`w-full bg-[#9BB168] text-white font-semibold py-2 sm:py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg hover:bg-green-700 text-sm sm:text-base ${submitted && "opacity-50"}`}
          >
            {submitted ? "Sending feedback..." : "Send feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
