import React, { useState } from 'react';
import { getToken } from '../../services/localStorageService';

const ApiTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint, name) => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      setResults(prev => ({
        ...prev,
        [name]: { error: 'No authentication token found' }
      }));
      setLoading(false);
      return;
    }

    try {
      console.log(`🔄 Testing ${name}: ${endpoint}`);
      
      const response = await fetch(`https://stressbackend.shop${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          responseData.error = errorJson;
        } catch (e) {
          responseData.error = errorText;
        }
      } else {
        const data = await response.json();
        responseData.data = data;
      }

      setResults(prev => ({
        ...prev,
        [name]: responseData
      }));

      console.log(`✅ ${name} result:`, responseData);

    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
      setResults(prev => ({
        ...prev,
        [name]: { error: error.message }
      }));
    }
    
    setLoading(false);
  };

  const testAllEndpoints = async () => {
    setResults({});
    
    const endpoints = [
      { url: '/api/doctor/earnings/history', name: 'Earnings History' },
      { url: '/api/doctor/earnings/stats', name: 'Earnings Stats' },
      { url: '/api/doctor/earnings/monthly-summary', name: 'Monthly Summary' },
      { url: '/api/doctor/earnings/confirmed', name: 'Confirmed Earnings' }
    ];

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint.url, endpoint.name);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100';
    if (status >= 400 && status < 500) return 'text-red-600 bg-red-100';
    if (status >= 500) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">API Endpoint Tester</h2>
      
      <div className="mb-4">
        <button
          onClick={testAllEndpoints}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]) => (
          <div key={name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{name}</h3>
              {result.status && (
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(result.status)}`}>
                  {result.status} {result.statusText}
                </span>
              )}
            </div>
            
            <div className="text-sm">
              {result.error && (
                <div className="text-red-600 mb-2">
                  <strong>Error:</strong> {JSON.stringify(result.error, null, 2)}
                </div>
              )}
              
              {result.data && (
                <div className="text-green-600 mb-2">
                  <strong>Success:</strong> Received {Array.isArray(result.data) ? result.data.length : 'object'} items
                  <details className="mt-1">
                    <summary className="cursor-pointer">View data</summary>
                    <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              
              {result.headers && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">Response Headers</summary>
                  <pre className="bg-blue-50 p-2 rounded mt-1 text-xs">
                    {JSON.stringify(result.headers, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTester;
