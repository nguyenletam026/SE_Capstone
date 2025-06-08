import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeImage } from '../../lib/user/stressServices';
import Webcam from "react-webcam";

// Constants
const HIGH_STRESS_THRESHOLD = 50;
const CHECK_INTERVAL = 3000; // 3 seconds
const CONSECUTIVE_HIGH_COUNT = 5; // Number of consecutive high readings to show warning

export default function StressMonitor() {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentStressLevels, setRecentStressLevels] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [highStressCount, setHighStressCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  
  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context for beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // High pitch beep
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  // Function to show browser notification and popup
  const showNotification = useCallback((message) => {
    // Show popup notification
    setShowPopup(true);
    
    // Play notification sound
    playNotificationSound();
    
    // Check if we have notification permission
    if (Notification.permission === 'granted') {
      new Notification('Stress Alert', {
        body: message,
        icon: '/logo.png'
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Stress Alert', {
            body: message,
            icon: '/logo.png'
          });
        }
      });
    }
  }, [playNotificationSound]);
  
  // Capture image and analyze stress
  const captureAndAnalyze = useCallback(async () => {
    if (!isMonitoring || !webcamRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError('Unable to capture image from webcam');
        return;
      }
      
      // Convert to blob for upload
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("image", blob, "webcam.jpg");
      
      // Send for analysis
      const result = await analyzeImage(formData);
      
      if (result?.code === 200) {
        // API returns a string (stressLevel)
        const stressLevel = result.result || 'UNKNOWN';
        
        // Map stress level to score range (0-100%)
        let stressScore = 0;
        let displayLevel = '';
        
        // Analysis based on actual API results
        switch (stressLevel) {
          case 'Extreme Stress': 
            stressScore = 95; 
            displayLevel = 'Extremely Stressed';
            break;
          case 'High Stress': 
            stressScore = 80; 
            displayLevel = 'High Stress';
            break;
          case 'Moderate Stress': 
            stressScore = 65; 
            displayLevel = 'Moderate Stress';
            break;
          case 'Mild Stress': 
            stressScore = 40; 
            displayLevel = 'Mild Stress';
            break;
          case 'Normal': 
            stressScore = 20; 
            displayLevel = 'Normal';
            break;
          case 'Relaxed': 
            stressScore = 5; 
            displayLevel = 'Relaxed';
            break;
          case 'No face detected!':
            stressScore = 0;
            displayLevel = 'No face detected';
            break;
          default: 
            stressScore = 0;
            displayLevel = `Unknown (${stressLevel})`;
        }
        
        // Create analysis object
        const newAnalysis = {
          id: Date.now().toString(),
          stressScore: stressScore,
          stressLevel: stressLevel,
          displayLevel: displayLevel,
          createdAt: new Date()
        };
        
        // Add to console for debugging
        console.log('Stress analysis:', { stressLevel, stressScore, displayLevel, result });
        
        // Only save results if face is detected
        if (stressLevel !== 'No face detected!') {
          // Update recent stress levels list
          setRecentStressLevels(prev => {
            const updated = [newAnalysis, ...prev].slice(0, 10); // Keep last 10
            return updated;
          });
          
          // Update high stress counter only for valid readings
          if (stressScore > HIGH_STRESS_THRESHOLD) {
            setHighStressCount(prev => prev + 1);
            
            // Show notification if we have 5 consecutive high stress readings
            if (highStressCount + 1 >= CONSECUTIVE_HIGH_COUNT) {
              showNotification('Your stress level has been consistently high! Please take a break and relax!');
              setHighStressCount(0); // Reset counter after notification
            }
          } else {
            // Reset counter if not high stress
            setHighStressCount(0);
          }
        } else {
          // Show light warning when no face is detected
          setError('No face detected, please adjust your webcam position');
        }
      } else {
        console.error('Image analysis error:', result);
        setError('Unable to analyze image. Please try again later.');
        setHighStressCount(0); // Reset counter on error
      }
    } catch (err) {
      console.error('Error analyzing stress level:', err);
      setError('Unable to connect to server. Please try again later.');
      setHighStressCount(0); // Reset counter on error
    } finally {
      setLoading(false);
    }
  }, [isMonitoring, webcamRef, highStressCount, showNotification]);
  
  // Set up monitoring interval
  useEffect(() => {
    let intervalId;
    
    if (isMonitoring) {
      // Request notification permission when monitoring starts
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
      // Set up interval for continuous capturing and analysis
      intervalId = setInterval(captureAndAnalyze, CHECK_INTERVAL);
      
      // Perform initial capture
      captureAndAnalyze();
    } else {
      // Reset high stress counter when monitoring stops
      setHighStressCount(0);
    }
    
    // Clean up interval on unmount or when monitoring stops
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, captureAndAnalyze]);

  // Auto-close popup after 10 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [showPopup]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Continuous Stress Level Monitoring</h2>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          disabled={loading}
          className={`px-4 py-2 rounded-md transition-colors ${
            isMonitoring 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
      
      {!isMonitoring && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
          <h3 className="font-medium text-blue-700 mb-1">Usage Instructions:</h3>
          <ul className="list-disc pl-5 text-sm text-blue-800">
            <li>Click "Start Monitoring" to activate camera and begin stress level analysis</li>
            <li>Ensure your face is clearly visible on camera</li>
            <li>System will analyze stress level every 3 seconds</li>
            <li>If {CONSECUTIVE_HIGH_COUNT} consecutive readings show stress level {'>'} {HIGH_STRESS_THRESHOLD}%, you will receive a notification</li>
            <li>When finished, click "Stop Monitoring" to turn off camera</li>
          </ul>
        </div>
      )}
      
      {/* Webcam Preview */}
      <div className={`mb-4 ${isMonitoring ? 'block' : 'hidden'}`}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-48 object-cover rounded border mx-auto"
          width={320}
          height={240}
          mirrored
        />
        <p className="text-xs text-gray-500 text-center mt-1">
          Capturing and analyzing every 3 seconds...
        </p>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {isMonitoring && (
        <div>
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              System is capturing and analyzing your stress level. You will receive alerts when stress level exceeds {HIGH_STRESS_THRESHOLD}% for {CONSECUTIVE_HIGH_COUNT} consecutive times.
            </p>
            {highStressCount > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Warning: Detected {highStressCount}/{CONSECUTIVE_HIGH_COUNT} consecutive high stress readings
                </p>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-700 mb-2">Recent Readings:</h3>
          
          {recentStressLevels.length === 0 ? (
            <p className="text-gray-500 italic">No stress data yet. Waiting for analysis...</p>
          ) : (
            <div className="space-y-2">
              {recentStressLevels.map((reading, index) => (
                <div 
                  key={reading.id || index}
                  className={`p-3 rounded-md ${
                    reading.stressScore > HIGH_STRESS_THRESHOLD
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {new Date(reading.createdAt).toLocaleTimeString()}
                    </span>
                    <span className={`font-bold ${
                      reading.stressScore > HIGH_STRESS_THRESHOLD ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {reading.stressScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Level: {reading.displayLevel || reading.stressLevel}
                    {reading.stressScore > HIGH_STRESS_THRESHOLD && (
                      <span className="ml-2 text-red-500 font-medium">⚠️ High</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Recent Readings */}
      {isMonitoring && recentStressLevels.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Recent Results</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-48 overflow-y-auto">
            {recentStressLevels.map((analysis) => (
              <div
                key={analysis.id}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <span className="font-medium">{analysis.displayLevel}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(analysis.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      analysis.stressScore > 70
                        ? "bg-red-100 text-red-800"
                        : analysis.stressScore > 40
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {analysis.stressScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isMonitoring && recentStressLevels.length === 0 ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Recent Results</h3>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
            <p className="text-lg font-medium text-gray-500">No Data</p>
            <p className="text-sm text-gray-400 mt-1">No analysis results yet</p>
          </div>
        </div>
      ) : null}

      {/* Stress Alert Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-2xl transform transition-all duration-300 animate-bounce">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4 animate-pulse">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-3">⚠️ High Stress Alert!</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Your stress level has been consistently high for <strong>5 consecutive readings</strong>. 
                <br />
                Please take a break and practice some relaxation techniques!
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Try deep breathing exercises or take a short walk
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setIsMonitoring(false); // Stop monitoring to encourage break
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Take a Break
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Continue
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">This popup will auto-close in 10 seconds</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 