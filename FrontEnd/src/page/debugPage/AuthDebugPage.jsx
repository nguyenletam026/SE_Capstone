import React, { useState, useEffect } from 'react';
import { debugAuthenticationState, testDoctorEarningsAPI } from '../../utils/debugAuth';
import ApiTester from '../../components/utils/ApiTester';
import { getToken } from '../../services/localStorageService';

const AuthDebugPage = () => {
  const [debugResult, setDebugResult] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-run debug on page load
    handleDebugAuth();
  }, []);

  const handleDebugAuth = () => {
    console.clear();
    const result = debugAuthenticationState();
    setDebugResult(result);
  };

  const handleTestAPI = async () => {
    setLoading(true);
    setApiTestResult(null);
    
    try {
      console.clear();
      await testDoctorEarningsAPI();
      setApiTestResult({ success: true, message: 'Check console for detailed results' });
    } catch (error) {
      setApiTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderDebugResult = () => {
    if (!debugResult) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">🔍 Authentication State</h3>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-medium text-gray-600 w-32">Token Found:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              debugResult.hasToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {debugResult.hasToken ? '✅ Yes' : '❌ No'}
            </span>
          </div>

          {debugResult.hasToken && (
            <>
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-32">Token Valid:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  !debugResult.isExpired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {!debugResult.isExpired ? '✅ Valid' : '❌ Expired'}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-32">Doctor Role:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  debugResult.hasDoctoRole ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugResult.hasDoctoRole ? '✅ Has DOCTOR role' : '❌ Missing DOCTOR role'}
                </span>
              </div>

              <div className="flex items-start">
                <span className="font-medium text-gray-600 w-32">Username:</span>
                <span className="text-gray-800">{debugResult.username || 'N/A'}</span>
              </div>

              <div className="flex items-start">
                <span className="font-medium text-gray-600 w-32">Roles:</span>
                <span className="text-gray-800">{debugResult.roles || 'N/A'}</span>
              </div>

              {debugResult.expiresAt && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-600 w-32">Expires At:</span>
                  <span className="text-gray-800">{debugResult.expiresAt.toLocaleString()}</span>
                </div>
              )}
            </>
          )}

          {debugResult.error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <span className="text-red-700">Error: {debugResult.error}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-blue-600 text-white rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">🔧 Authentication Debug Tool</h1>
          <p className="text-blue-100">
            Diagnose authentication issues with the doctor earnings API endpoint
          </p>
        </div>

        {/* Current Token Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📋 Raw Token Info</h3>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
            {getToken() ? `Token Length: ${getToken().length} characters` : 'No token found'}
          </div>
          {getToken() && (
            <div className="mt-2 bg-gray-100 p-3 rounded text-xs font-mono break-all max-h-32 overflow-y-auto">
              <strong>Token:</strong> {getToken().substring(0, 50)}...
            </div>
          )}
        </div>

        {/* Debug Results */}
        {renderDebugResult()}

        {/* API Test Results */}
        {apiTestResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🌐 API Test Results</h3>
            <div className={`p-3 rounded ${
              apiTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {apiTestResult.success ? '✅ ' : '❌ '}
              {apiTestResult.message || apiTestResult.error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🚀 Test Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleDebugAuth}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🔍 Debug Authentication State
            </button>
            
            <button
              onClick={handleTestAPI}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {loading ? '⏳ Testing API...' : '🌐 Test Doctor Earnings API'}
            </button>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-700 text-sm">
                💡 <strong>Tip:</strong> Open browser Developer Tools (F12) → Console tab to see detailed debug output
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">        <h3 className="text-lg font-semibold mb-4 text-gray-800">📝 Troubleshooting Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>First, make sure you're logged in as a user with DOCTOR role</li>
            <li>Check if your JWT token contains the "ROLE_DOCTOR" scope</li>
            <li>Verify token expiration time</li>
            <li>Test the API endpoint directly</li>
            <li>Check browser console for detailed error messages</li>
          </ol>
        </div>

        {/* API Endpoint Tester */}
        <div className="mt-6">
          <ApiTester />
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;
