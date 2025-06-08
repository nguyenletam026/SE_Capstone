import React, { useState } from "react";
import Bot from "../../assets/4.png";

const mockMessages = [
  {
    id: 1,
    from: "user",
    avatar: "/user1.jpg",
    content: "I've been feeling very stressed lately...",
    time: "2h",
  },
  {
    id: 2,
    from: "doctor",
    avatar: "/doctor1.jpg",
    content: "Please try to describe specifically the situations that make you feel stressed.",
    time: "1h",
  },
];

export default function ChatWithDoctor() {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now(),
        from: "user",
        avatar: "/user1.jpg",
        content: input,
        time: "now",
      };
      setMessages([...messages, newMessage]);
      setInput("");
    }
  };

  return (
    <div className="bg-yellow-100 min-h-screen p-6">
      {/* Bot mascot */}
      <div className="flex justify-center mb-2">
        <img src={Bot} alt="Bot" className="w-32 h-32" />
      </div>

      {/* Chat box */}
      <div className="bg-white rounded-xl p-4 max-w-4xl mx-auto shadow-md">
        {/* Message list */}
        <div className="space-y-4 mb-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.from === "user" ? "justify-start" : "justify-end"
              } items-start gap-2`}
            >
              <img
                src={msg.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.from === "user"
                    ? "bg-pink-200 text-black"
                    : "bg-indigo-200 text-black"
                }`}
              >
                {msg.content}
              </div>
              <div className="text-xs text-gray-400 mt-1">{msg.time}</div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="flex items-center border rounded-full px-4 py-2 gap-2">
          <span className="text-xl">... </span>
          <input
            type="text"
            placeholder="Type here ................................."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow outline-none text-sm"
          />
          <button onClick={handleSend}>
            <span className="text-xl">� paper plane</span>
          </button>
          <button>
            <span className="text-xl">🎥</span>
          </button>
        </div>
      </div>
    </div>
  );
}
