import React, { useState, useEffect } from 'react';
import { 
  getDoctorEarningsStats, 
  getDoctorEarnings, 
  getDoctorMonthlySummary,
  getDoctorEarningsByDateRange 
} from '../../lib/doctor/earningsService';
import { debugAuthenticationState, testDoctorEarningsAPI } from '../../utils/debugAuth';
import { getDoctorCommissionRate } from '../../lib/admin/adminServices';

const DoctorEarningsDashboard = () => {  const [stats, setStats] = useState({});
  const [earnings, setEarnings] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDebug, setShowDebug] = useState(false);
  const [commissionRate, setCommissionRate] = useState(null);
  const [platformFee, setPlatformFee] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  useEffect(() => {
    // Check authentication state first
    console.log('🔍 Checking authentication state...');
    const authState = debugAuthenticationState();
    
    if (!authState?.hasToken) {
      console.error('❌ No authentication token found');
      setLoading(false);
      return;
    }
    
    if (authState?.isExpired) {
      console.error('❌ Authentication token is expired');
      setLoading(false);
      return;
    }
    
    if (!authState?.hasDoctoRole) {
      console.error('❌ User does not have DOCTOR role:', authState?.roles);
      setLoading(false);
      return;
    }
    
    console.log('✅ Authentication checks passed, fetching data...');
    fetchData();
  }, []);  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Starting to fetch doctor earnings data...');
      
      // Fetch commission rate first
      try {
        console.log('📊 Fetching commission rate...');
        const rate = await getDoctorCommissionRate();
        console.log('✅ Commission rate received:', rate);
        setCommissionRate(rate);
        setPlatformFee(100 - rate); // Calculate platform fee
      } catch (error) {
        console.error('❌ Error fetching commission rate:', error);
        // Set default values if API fails
        setCommissionRate(70);
        setPlatformFee(30);
      }
      
      // Fetch each endpoint individually to identify which one fails
      try {
        console.log('📊 Fetching earnings stats...');
        const statsData = await getDoctorEarningsStats();
        console.log('✅ Stats data received:', statsData);
        setStats(statsData);
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        console.error('Stats error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      
      try {
        console.log('📈 Fetching earnings history...');
        const earningsData = await getDoctorEarnings();
        console.log('✅ Earnings data received:', earningsData);
        setEarnings(earningsData);
      } catch (error) {
        console.error('❌ Error fetching earnings history:', error);
        console.error('Earnings error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      
      try {
        console.log('📅 Fetching monthly summary...');
        const summaryData = await getDoctorMonthlySummary();
        console.log('✅ Monthly summary data received:', summaryData);
        setMonthlySummary(summaryData);
      } catch (error) {
        console.error('❌ Error fetching monthly summary:', error);
        console.error('Summary error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      
    } catch (error) {
      console.error('❌ Unexpected error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };  const handleDateRangeSearch = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      const rangeData = await getDoctorEarningsByDateRange(
        dateRange.startDate + 'T00:00:00',
        dateRange.endDate + 'T23:59:59'
      );
      setEarnings(rangeData);
    } catch (error) {
      console.error('Error fetching earnings by date range:', error);
    }
  };

  // Debug functions
  const handleDebugAuth = () => {
    console.log('=== DEBUG: Authentication State ===');
    debugAuthenticationState();
  };

  const handleTestAPI = async () => {
    console.log('=== DEBUG: Testing Doctor Earnings API ===');
    await testDoctorEarningsAPI();
  };  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      WITHDRAWN: 'bg-blue-100 text-blue-800'
    };    const statusTexts = {
      PENDING: 'Pending Confirmation',
      CONFIRMED: 'Confirmed',
      WITHDRAWN: 'Withdrawn'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusTexts[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (    <div className="container mx-auto px-4 py-6">      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Earnings</h1>
        <p className="text-gray-600">Manage and track earnings from consultations</p>
      </div>

      {/* Debug Panel */}
      <div className="mb-6">
    
        
        {showDebug && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Debug Authentication</h3>            <div className="space-x-3">              <button 
                onClick={handleDebugAuth}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Check Token
              </button>
              <button 
                onClick={handleTestAPI}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Test API Endpoint
              </button>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Open Developer Console (F12) to view debug results
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalEarnings || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.confirmedEarnings || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Confirmation</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency((stats.totalEarnings || 0) - (stats.confirmedEarnings || 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Number of Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{earnings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Earnings History
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monthly'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Monthly Report
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">          {activeTab === 'overview' && (
            <div>              <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings Overview</h3>
              
              {/* Commission Rate and Platform Fee Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border border-blue-100">
                <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Commission and Platform Fee Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Commission Rate:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {commissionRate !== null ? `${commissionRate}%` : 'Loading...'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Your share from each consultation</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Platform Fee:</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {platformFee !== null ? `${platformFee}%` : 'Loading...'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Platform's retained portion</p>
                  </div>
                </div>
              </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Quick Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of consultations:</span>
                      <span className="font-medium">{earnings.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {earnings.slice(0, 5).map((earning) => (
                      <div key={earning.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="text-sm font-medium">{formatCurrency(earning.doctorEarning)}</p>
                          <p className="text-xs text-gray-500">{formatDate(earning.createdAt)}</p>
                        </div>
                        {getStatusBadge(earning.status)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Earnings History</h3>
                <div className="flex space-x-4">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button
                    onClick={handleDateRangeSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Earnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earnings.map((earning) => (
                      <tr key={earning.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(earning.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(earning.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(earning.doctorEarning)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(earning.platformFee)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(earning.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'monthly' && (            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Report</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month/Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Earnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlySummary.map((summary, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {summary[1]}/{summary[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {summary[2]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(summary[3])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorEarningsDashboard;
