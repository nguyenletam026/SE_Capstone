import React from "react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiSearch, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const EmptyState = ({ searchTerm, onStartChat }) => {
  const navigate = useNavigate();

  if (searchTerm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <FiSearch className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy kết quả
        </h3>
        <p className="text-gray-600 mb-6">
          Không tìm thấy cuộc trò chuyện nào với từ khóa "{searchTerm}"
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
        <FiMessageCircle className="w-16 h-16 text-blue-500" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Chưa có cuộc trò chuyện nào
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        Bạn chưa có lịch sử chat với bác sĩ nào. Hãy bắt đầu tư vấn với các bác sĩ chuyên nghiệp để được hỗ trợ sức khỏe tốt nhất.
      </p>

      <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <button
          onClick={() => navigate("/doctors")}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <FiUser className="w-5 h-5" />
          <span>Tìm bác sĩ</span>
        </button>
        
        <button
          onClick={() => navigate("/consultation")}
          className="w-full sm:w-auto px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <FiMessageCircle className="w-5 h-5" />
          <span>Tư vấn ngay</span>
        </button>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👨‍⚕️</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Bác sĩ chuyên nghiệp</h4>
          <p className="text-sm text-gray-600">Đội ngũ bác sĩ giàu kinh nghiệm</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Chat trực tuyến</h4>
          <p className="text-sm text-gray-600">Tư vấn nhanh chóng, tiện lợi</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Bảo mật tuyệt đối</h4>
          <p className="text-sm text-gray-600">Thông tin được bảo vệ an toàn</p>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyState;
