import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getChatHistory } from "../../lib/util/chatServices";
import ChatHistoryCard from "../../components/chat/ChatHistoryCard";
import ChatHistoryLoading from "../../components/chat/ChatHistoryLoading";
import EmptyState from "../../components/chat/EmptyState";
import { 
  FiMessageCircle, 
  FiClock, 
  FiUser, 
  FiSearch, 
  FiFilter,
  FiArrowRight,
  FiCalendar,
  FiHeart,
  FiStar,
  FiRefreshCw,
  FiMessageSquare,
  FiChevronRight,
  FiX
} from "react-icons/fi";
import { MdOutlineHealthAndSafety } from "react-icons/md";

export default function ChatHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, expired
  const [sortBy, setSortBy] = useState("lastMessage"); // lastMessage, doctorName, date

  useEffect(() => {
    if (user?.id) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const history = await getChatHistory(user.id);
      setChatHistory(history || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("Không thể tải lịch sử chat");
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chatItem) => {
    // Navigate to chat room with the selected doctor
    const doctorToChat = {
      doctorId: chatItem.doctorId,
      doctorName: chatItem.doctorName,
      doctorAvatar: chatItem.doctorAvatar,
      uniqueId: `history-${chatItem.doctorId}-${Date.now()}`
    };

    navigate("/chatroom", {
      state: {
        doctorToChat,
        fromHistory: true
      }
    });
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "Chưa có tin nhắn";
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return "Hôm qua";
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    } else {
      return messageDate.toLocaleDateString("vi-VN");
    }
  };

  const filteredAndSortedHistory = chatHistory
    .filter(chat => {
      const matchesSearch = chat.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === "all") return matchesSearch;
      if (filterStatus === "active") return matchesSearch && chat.isActive;
      if (filterStatus === "expired") return matchesSearch && !chat.isActive;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "doctorName":
          return a.doctorName?.localeCompare(b.doctorName);
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "lastMessage":
        default:
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                <FiMessageCircle className="text-2xl sm:text-4xl text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Lịch sử Chat</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">Đang tải dữ liệu...</p>
          </motion.div>
          <ChatHistoryLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-8 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <FiMessageCircle className="text-2xl sm:text-4xl text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Lịch sử Chat</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Xem lại các cuộc trò chuyện với bác sĩ</p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 mb-6 sm:mb-8"
        >
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bác sĩ hoặc tin nhắn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent placeholder-gray-500 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
              {/* Filter Status */}
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" size={16} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Đã hết hạn</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base min-w-0 flex-1 sm:flex-none"
                >
                  <option value="lastMessage">Tin nhắn mới nhất</option>
                  <option value="doctorName">Tên bác sĩ</option>
                  <option value="date">Ngày tạo</option>
                </select>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchChatHistory}
                className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Làm mới"
              >
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Chat History List */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {filteredAndSortedHistory.length === 0 ? (
              <EmptyState 
                searchTerm={searchTerm} 
                onStartChat={() => navigate("/chatroom")}
              />
            ) : (
              filteredAndSortedHistory.map((chatItem, index) => (
                <motion.div
                  key={`${chatItem.doctorId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChatHistoryCard 
                    chatItem={chatItem} 
                    onClick={handleChatSelect}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        {filteredAndSortedHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-indigo-600">{chatHistory.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Tổng số cuộc chat</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {chatHistory.filter(chat => chat.isActive).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Đang hoạt động</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {chatHistory.reduce((total, chat) => total + (chat.totalMessages || 0), 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Tổng tin nhắn</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
