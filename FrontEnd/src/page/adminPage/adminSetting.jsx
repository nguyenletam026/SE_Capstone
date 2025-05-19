import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/utils/Sidebar';
import AdminHeader from '../../components/header/adminHeader';
import { getChatCost, updateChatCost, getAllSystemConfigs } from '../../lib/admin/adminServices';
import { toast } from 'react-toastify';

export default function AdminSetting() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatCost, setChatCost] = useState('');
  const [newChatCost, setNewChatCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [systemConfigs, setSystemConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);

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
    } catch (error) {
      console.error('Error updating chat cost:', error);
      toast.error('Không thể cập nhật giá chat. Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <AdminHeader user={user} />

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Cài đặt hệ thống</h1>

          {/* Chat Cost Setting Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Thiết lập giá chat với bác sĩ</h2>
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1 mb-4 md:mb-0">
                <label className="block text-sm font-medium text-gray-700">Giá hiện tại:</label>
                <div className="mt-1 text-lg font-semibold">
                  {chatCost ? `${chatCost.toLocaleString('vi-VN')} VNĐ/giờ` : 'Đang tải...'}
                </div>
              </div>
              <div className="flex-1">
                <label htmlFor="newChatCost" className="block text-sm font-medium text-gray-700">
                  Giá mới (VNĐ/giờ):
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    id="newChatCost"
                    className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                    value={newChatCost}
                    onChange={(e) => setNewChatCost(e.target.value)}
                    min="0"
                    step="1000"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    VNĐ
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSaveChatCost}
                  disabled={isSaving}
                >
                  {isSaving ? 'Đang lưu...' : 'Cập nhật giá'}
                </button>
              </div>
            </div>
          </div>

          {/* All System Configurations Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tất cả cấu hình hệ thống</h2>
            {loadingConfigs ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khóa
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá trị
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian cập nhật
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {systemConfigs.map((config) => (
                      <tr key={config.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {config.configKey}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {config.configValue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {config.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(config.updatedAt || config.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
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
