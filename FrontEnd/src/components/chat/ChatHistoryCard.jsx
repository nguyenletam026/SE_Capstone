import React from "react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiClock, FiStar, FiChevronRight } from "react-icons/fi";
import { MdOutlineHealthAndSafety } from "react-icons/md";

const ChatHistoryCard = ({ chatItem, onClick }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("vi-VN", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } else if (diffDays === 1) {
      return "Hôm qua";
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  const truncateMessage = (message, maxLength = 60) => {
    if (!message) return "Chưa có tin nhắn";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
      onClick={() => onClick(chatItem)}
    >
      <div className="p-6">
        {/* Header với thông tin bác sĩ */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={chatItem.doctorAvatar || "/default-avatar.png"}
                alt={chatItem.doctorName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                chatItem.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {chatItem.doctorName}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MdOutlineHealthAndSafety className="w-4 h-4 text-blue-500" />
                <span>{chatItem.doctorSpecialty}</span>
                <div className="flex items-center ml-2">
                  <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="ml-1 text-xs">{chatItem.doctorRating || 4.5}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              chatItem.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {chatItem.isActive ? 'Đang hoạt động' : 'Đã hết hạn'}
            </span>
            {chatItem.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {chatItem.unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Tin nhắn cuối cùng */}
        <div className="mb-4">
          <div className="flex items-start space-x-2">
            <FiMessageCircle className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-sm leading-relaxed flex-1">
              {truncateMessage(chatItem.lastMessage)}
            </p>
          </div>
        </div>

        {/* Footer với thời gian và thống kê */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FiClock className="w-3 h-3" />
              <span>{formatTime(chatItem.lastMessageTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiMessageCircle className="w-3 h-3" />
              <span>{chatItem.totalMessages} tin nhắn</span>
            </div>
          </div>
          
          <div className="flex items-center text-blue-600 text-sm font-medium">
            <span className="mr-1">Xem chi tiết</span>
            <FiChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHistoryCard;
