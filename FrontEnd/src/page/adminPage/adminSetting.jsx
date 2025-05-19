import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/utils/Sidebar';
import AdminHeader from '../../components/header/adminHeader';
import { getChatCost, updateChatCost, getAllSystemConfigs } from '../../lib/admin/adminServices';
import { toast } from 'react-toastify';
import { 
  FiSettings, 
  FiDollarSign, 
  FiSave, 
  FiList, 
  FiClock, 
  FiInfo, 
  FiAlertCircle,
  FiCheckCircle,
  FiEdit
} from 'react-icons/fi';

export default function AdminSetting() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatCost, setChatCost] = useState('');
  const [newChatCost, setNewChatCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [systemConfigs, setSystemConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    } else if (user) {
      fetchChatCost();
      fetchSystemConfigs();
    }
  }, [loading, user, navigate]);

  const fetchChatCost = async () => {
    try {
      const cost = await getChatCost();
      setChatCost(cost);
      setNewChatCost(cost);
    } catch (error) {
      console.error('Error fetching chat cost:', error);
      toast.error('Không thể tải giá chat. Vui lòng thử lại sau.');
    }
  };

  const fetchSystemConfigs = async () => {
    setLoadingConfigs(true);
    try {
      const configs = await getAllSystemConfigs();
      setSystemConfigs(configs);
    } catch (error) {
      console.error('Error fetching system configs:', error);
      toast.error('Không thể tải cấu hình hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoadingConfigs(false);
    }
  };

  const handleSaveChatCost = async () => {
    if (!newChatCost || isNaN(newChatCost) || parseFloat(newChatCost) <= 0) {
      toast.error('Vui lòng nhập giá trị hợp lệ lớn hơn 0');
      return;
    }

    setIsSaving(true);
    try {
      await updateChatCost(parseFloat(newChatCost));
      setChatCost(parseFloat(newChatCost));
      toast.success('Đã cập nhật giá chat thành công!');
      fetchSystemConfigs(); // Refresh all configs
      setEditMode(false);
    } catch (error) {
      console.error('Error updating chat cost:', error);
      toast.error('Không thể cập nhật giá chat. Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-lg font-medium text-gray-700">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <AdminHeader user={user} />

        <div className="p-6 max-w-7xl mx-auto">
          {/* Page header */}
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
            <FiSettings className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Cài đặt hệ thống</h1>
          </div>

          {/* Chat Cost Setting Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 mb-6">
            <div className="flex items-center mb-4">
              <FiDollarSign className="h-6 w-6 text-emerald-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Thiết lập giá chat với bác sĩ</h2>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-4 mb-5">
              <div className="flex items-center text-indigo-800">
                <FiInfo className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">Giá này sẽ được áp dụng cho tất cả các cuộc trò chuyện mới với bác sĩ trên hệ thống.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá hiện tại:</label>
                <div className="flex items-center rounded-lg bg-gray-50 p-3 border border-gray-200">
                  <FiDollarSign className="h-6 w-6 text-gray-500 mr-2" />
                  <div className="text-lg font-semibold text-gray-800">
                    {chatCost ? `${chatCost.toLocaleString('vi-VN')} VNĐ/giờ` : 'Đang tải...'}
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                {editMode ? (
                  <>
                    <label htmlFor="newChatCost" className="block text-sm font-medium text-gray-700 mb-1">
                      Giá mới (VNĐ/giờ):
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <FiDollarSign className="h-4 w-4" />
                      </span>
                      <input
                        type="number"
                        id="newChatCost"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        value={newChatCost}
                        onChange={(e) => setNewChatCost(e.target.value)}
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      * Nhập giá trị làm tròn đến hàng nghìn (ví dụ: 100000)
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-end">
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Thay đổi giá
                    </button>
                  </div>
                )}
              </div>
              
              {editMode && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleSaveChatCost}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {
                      setEditMode(false);
                      setNewChatCost(chatCost);
                    }}
                    disabled={isSaving}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* All System Configurations Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FiList className="h-6 w-6 text-indigo-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Tất cả cấu hình hệ thống</h2>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {systemConfigs.length} cấu hình
              </span>
            </div>

            {loadingConfigs ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá trị
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cập nhật lần cuối
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {systemConfigs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          <FiAlertCircle className="inline-block h-5 w-5 mr-2 text-yellow-500" />
                          Không có cấu hình nào được tìm thấy
                        </td>
                      </tr>
                    ) : (
                      systemConfigs.map((config) => (
                        <tr key={config.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {config.configKey === 'CHAT_COST_PER_HOUR' ? (
                                <FiDollarSign className="h-5 w-5 text-emerald-500 mr-2" />
                              ) : (
                                <FiSettings className="h-5 w-5 text-gray-500 mr-2" />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {config.configKey === 'CHAT_COST_PER_HOUR' ? 'Giá chat với bác sĩ' : config.configKey}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-md bg-gray-100 text-gray-800">
                              {config.configValue}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config.description || 'Không có mô tả'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiClock className="h-4 w-4 mr-1 text-gray-400" />
                              {new Date(config.updatedAt || config.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheckCircle className="h-3 w-3 mr-1" /> Hoạt động
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}