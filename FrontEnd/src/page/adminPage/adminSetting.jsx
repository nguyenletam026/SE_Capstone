import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/utils/Sidebar';
import AdminHeader from '../../components/header/adminHeader';
import { getChatCost, updateChatCost, getAllSystemConfigs, getDoctorCommissionRate, updateDoctorCommissionRate, getChatCostPerMinute, updateChatCostPerMinute } from '../../lib/admin/adminServices';
import { toast } from 'react-toastify';
import { 
  FiSettings, 
  FiSave, 
  FiList, 
  FiClock, 
  FiInfo, 
  FiAlertCircle,
  FiCheckCircle,
  FiEdit,
  FiX,
  FiSliders,
  FiDatabase,
  FiRefreshCw
} from 'react-icons/fi';

export default function AdminSetting() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);  const [chatCost, setChatCost] = useState('');
  const [newChatCost, setNewChatCost] = useState('');
  const [chatCostPerMinute, setChatCostPerMinute] = useState('');
  const [newChatCostPerMinute, setNewChatCostPerMinute] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [systemConfigs, setSystemConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editModeMinute, setEditModeMinute] = useState(false);
  const [editModeCommission, setEditModeCommission] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('2025-05-24 11:27:24');
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });    } else if (user) {
      fetchChatCost();
      fetchChatCostPerMinute();
      fetchCommissionRate();
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
      toast.error('Unable to load chat cost. Please try again later.');
    }
  };

  const fetchChatCostPerMinute = async () => {
    try {
      const cost = await getChatCostPerMinute();
      setChatCostPerMinute(cost);
      setNewChatCostPerMinute(cost);
    } catch (error) {
      console.error('Error fetching chat cost per minute:', error);
      toast.error('Unable to load chat cost per minute. Please try again later.');
    }
  };

  const fetchCommissionRate = async () => {
    try {
      const rate = await getDoctorCommissionRate();
      setCommissionRate(rate);
      setNewCommissionRate(rate);
    } catch (error) {
      console.error('Error fetching commission rate:', error);
      toast.error('Unable to load commission rate. Please try again later.');
    }
  };

  const fetchSystemConfigs = async () => {
    setLoadingConfigs(true);
    try {
      const configs = await getAllSystemConfigs();
      setSystemConfigs(configs);
      setLastUpdated(new Date().toISOString().replace('T', ' ').substring(0, 19));
    } catch (error) {
      console.error('Error fetching system configs:', error);
      toast.error('Unable to load system configurations. Please try again later.');
    } finally {
      setLoadingConfigs(false);
    }
  };
  const handleSaveChatCost = async () => {
    if (!newChatCost || isNaN(newChatCost) || parseFloat(newChatCost) <= 0) {
      toast.error('Please enter a valid value greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      await updateChatCost(parseFloat(newChatCost));
      setChatCost(parseFloat(newChatCost));
      toast.success('Chat cost updated successfully!');
      fetchSystemConfigs(); // Refresh all configs
      setEditMode(false);
    } catch (error) {
      console.error('Error updating chat cost:', error);
      toast.error('Unable to update chat cost. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChatCostPerMinute = async () => {
    if (!newChatCostPerMinute || isNaN(newChatCostPerMinute) || parseFloat(newChatCostPerMinute) <= 0) {
      toast.error('Please enter a valid value greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      await updateChatCostPerMinute(parseFloat(newChatCostPerMinute));
      setChatCostPerMinute(parseFloat(newChatCostPerMinute));
      toast.success('Chat cost per minute updated successfully!');
      fetchSystemConfigs(); // Refresh all configs
      setEditModeMinute(false);
    } catch (error) {
      console.error('Error updating chat cost per minute:', error);
      toast.error('Unable to update chat cost per minute. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCommissionRate = async () => {
    if (!newCommissionRate || isNaN(newCommissionRate) || parseFloat(newCommissionRate) <= 0 || parseFloat(newCommissionRate) > 100) {
      toast.error('Please enter a valid percentage between 0 and 100');
      return;
    }

    setIsSaving(true);
    try {
      await updateDoctorCommissionRate(parseFloat(newCommissionRate));
      setCommissionRate(parseFloat(newCommissionRate));
      toast.success('Commission rate updated successfully!');
      fetchSystemConfigs(); // Refresh all configs
      setEditModeCommission(false);
    } catch (error) {
      console.error('Error updating commission rate:', error);
      toast.error('Unable to update commission rate. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8 rounded-2xl bg-white shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <span className="text-lg font-medium text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <AdminHeader user={user} />

        <div className="p-8 max-w-7xl mx-auto">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 mr-4">
                <FiSettings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">System Settings</h1>
                <p className="text-gray-500 mt-1">Manage your application's global configurations</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Last refreshed:</span>
              <span className="text-sm font-medium text-gray-700">{lastUpdated}</span>
              <button 
                onClick={fetchSystemConfigs} 
                className="ml-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Chat Cost Setting Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500 mr-4">
                <span className="text-lg font-semibold">₫</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Doctor Chat Pricing</h2>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border-l-4 border-blue-400">
              <div className="flex items-start text-blue-800">
                <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">This price will be applied to all new chat sessions with doctors across the platform. Changes will affect future billing cycles.</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Rate:</label>
                <div className="flex items-center rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 text-gray-500 mr-3">
                    <span className="text-lg font-semibold">₫</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold text-gray-800">
                      {chatCost ? `${chatCost.toLocaleString('en-US')} VND/hour` : 'Loading...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {lastUpdated}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                {editMode ? (
                  <>
                    <label htmlFor="newChatCost" className="block text-sm font-medium text19:47:42, 7/6/2025-gray-700 mb-2">
                      New Rate (VND/hour):
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-sm">
                      <span className="inline-flex items-center px-4 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <span className="text-lg font-semibold">₫</span>
                      </span>
                      <input
                        type="number"
                        id="newChatCost"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full px-4 py-3 sm:text-sm border-gray-300"
                        value={newChatCost}
                        onChange={(e) => setNewChatCost(e.target.value)}
                        min="0"
                        step="1000"
                        placeholder="Enter new rate"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <FiInfo className="h-3 w-3 mr-1" />
                      Enter value rounded to thousands (e.g., 100000)
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-end">
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Change Price
                    </button>
                  </div>
                )}
              </div>
              
              {editMode && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    onClick={handleSaveChatCost}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2.5 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    onClick={() => {
                      setEditMode(false);
                      setNewChatCost(chatCost);
                    }}
                    disabled={isSaving}
                  >
                    <FiX className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>              )}            </div>
          </div>

          {/* Chat Cost Per Minute Setting Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-500 mr-4">
                <span className="text-lg font-semibold">₫</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Doctor Chat Pricing (Per Minute)</h2>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4 mb-6 border-l-4 border-purple-400">
              <div className="flex items-start text-purple-800">
                <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">This price will be applied to minute-based chat sessions with doctors. Users can choose between hourly or minute-based pricing options.</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Rate:</label>
                <div className="flex items-center rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 text-gray-500 mr-3">
                    <span className="text-lg font-semibold">₫</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold text-gray-800">
                      {chatCostPerMinute ? `${chatCostPerMinute.toLocaleString('en-US')} VND/minute` : 'Loading...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {lastUpdated}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                {editModeMinute ? (
                  <>
                    <label htmlFor="newChatCostPerMinute" className="block text-sm font-medium text-gray-700 mb-2">
                      New Rate (VND/minute):
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-sm">
                      <span className="inline-flex items-center px-4 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <span className="text-lg font-semibold">₫</span>
                      </span>
                      <input
                        type="number"
                        id="newChatCostPerMinute"
                        className="focus:ring-purple-500 focus:border-purple-500 flex-1 block w-full px-4 py-3 sm:text-sm border-gray-300"
                        value={newChatCostPerMinute}
                        onChange={(e) => setNewChatCostPerMinute(e.target.value)}
                        min="0"
                        step="100"
                        placeholder="Enter new rate"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <FiInfo className="h-3 w-3 mr-1" />
                      Enter value in VND (e.g., 2000)
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-end">
                    <button
                      onClick={() => setEditModeMinute(true)}
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Change Price
                    </button>
                  </div>
                )}
              </div>
              
              {editModeMinute && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                    onClick={handleSaveChatCostPerMinute}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2.5 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                    onClick={() => {
                      setEditModeMinute(false);
                      setNewChatCostPerMinute(chatCostPerMinute);
                    }}
                    disabled={isSaving}
                  >
                    <FiX className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Commission Rate Setting Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-500 mr-4">
                <span className="text-lg font-semibold">%</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Doctor Commission Rate</h2>
            </div>
            
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border-l-4 border-amber-400">
              <div className="flex items-start text-amber-800">
                <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">This percentage determines how much doctors earn from each consultation. The remaining amount goes to the platform. Changes will affect future earnings calculations.</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Commission Rate:</label>
                <div className="flex items-center rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 text-gray-500 mr-3">
                    <span className="text-lg font-semibold">%</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold text-gray-800">
                      {commissionRate ? `${commissionRate}%` : 'Loading...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Platform receives: {commissionRate ? `${(100 - commissionRate).toFixed(1)}%` : 'Loading...'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                {editModeCommission ? (
                  <>
                    <label htmlFor="newCommissionRate" className="block text-sm font-medium text-gray-700 mb-2">
                      New Commission Rate (%):
                    </label>
                    <div className="flex rounded-xl overflow-hidden shadow-sm">
                      <input
                        type="number"
                        id="newCommissionRate"
                        className="focus:ring-orange-500 focus:border-orange-500 flex-1 block w-full px-4 py-3 sm:text-sm border-gray-300"
                        value={newCommissionRate}
                        onChange={(e) => setNewCommissionRate(e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="Enter percentage (0-100)"
                      />
                      <span className="inline-flex items-center px-4 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        <span className="text-lg font-semibold">%</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <FiInfo className="h-3 w-3 mr-1" />
                      Platform will receive: {newCommissionRate ? `${(100 - parseFloat(newCommissionRate)).toFixed(1)}%` : '0%'}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-end">
                    <button
                      onClick={() => setEditModeCommission(true)}
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Change Rate
                    </button>
                  </div>
                )}
              </div>
              
              {editModeCommission && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                    onClick={handleSaveCommissionRate}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2.5 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                    onClick={() => {
                      setEditModeCommission(false);
                      setNewCommissionRate(commissionRate);
                    }}
                    disabled={isSaving}
                  >
                    <FiX className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* All System Configurations Table */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-500 mr-4">
                  <FiDatabase className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">System Configurations</h2>
                  <p className="text-sm text-gray-500 mt-1">All global settings that control your application</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {systemConfigs.length} configurations
                </span>
              </div>
            </div>

            {loadingConfigs ? (
              <div className="flex justify-center items-center p-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-indigo-500"></div>
                <span className="ml-4 text-gray-600 font-medium">Loading configurations...</span>
              </div>
            ) : (
              <div className="overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {systemConfigs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                            <div className="flex flex-col items-center">
                              <FiAlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
                              <p>No configurations found</p>
                              <button className="mt-3 px-4 py-2 text-xs text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                                Add New Configuration
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        systemConfigs.map((config) => (
                          <tr key={config.id} className="hover:bg-gray-50 transition-colors">                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {config.configKey === 'CHAT_COST_PER_HOUR' ? (
                                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                                    <span className="text-sm font-semibold text-emerald-600">₫</span>
                                  </div>
                                ) : config.configKey === 'CHAT_COST_PER_MINUTE' ? (
                                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                                    <span className="text-sm font-semibold text-purple-600">₫</span>
                                  </div>
                                ) : config.configKey === 'DOCTOR_COMMISSION_RATE' ? (
                                  <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                                    <span className="text-sm font-semibold text-orange-600">%</span>
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                                    <FiSliders className="h-4 w-4 text-indigo-600" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                  {config.configKey === 'CHAT_COST_PER_HOUR' ? 'Doctor Chat Cost (Hourly)' : 
                                   config.configKey === 'CHAT_COST_PER_MINUTE' ? 'Doctor Chat Cost (Per Minute)' :
                                   config.configKey === 'DOCTOR_COMMISSION_RATE' ? 'Doctor Commission Rate' : 
                                   config.configKey}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-3 py-1.5 inline-flex text-sm font-semibold rounded-md bg-gray-100 text-gray-800">
                                {config.configValue}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {config.description || 'No description available'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <FiClock className="h-4 w-4 mr-1.5 text-gray-400" />
                                {new Date(config.updatedAt || config.createdAt).toLocaleString('en-US')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FiCheckCircle className="h-3 w-3 mr-1" /> Active
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}