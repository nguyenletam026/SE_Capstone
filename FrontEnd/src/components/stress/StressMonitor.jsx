import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeImage } from '../../lib/user/stressServices';
import Webcam from "react-webcam";

// Constants
const HIGH_STRESS_THRESHOLD = 50;
const CHECK_INTERVAL = 3000; // 3 seconds
const CONSECUTIVE_HIGH_COUNT = 5; // Số lần liên tiếp cao để hiển thị cảnh báo

export default function StressMonitor() {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentStressLevels, setRecentStressLevels] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [highStressCount, setHighStressCount] = useState(0);
  
  // Function to show browser notification
  const showNotification = useCallback((message) => {
    // Check if we have notification permission
    if (Notification.permission === 'granted') {
      new Notification('Cảnh báo căng thẳng', {
        body: message,
        icon: '/logo.png'
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Cảnh báo căng thẳng', {
            body: message,
            icon: '/logo.png'
          });
        }
      });
    }
  }, []);
  
  // Capture image and analyze stress
  const captureAndAnalyze = useCallback(async () => {
    if (!isMonitoring || !webcamRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError('Không thể chụp ảnh từ webcam');
        return;
      }
      
      // Convert to blob for upload
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("image", blob, "webcam.jpg");
      
      // Send for analysis
      const result = await analyzeImage(formData);
      
      if (result?.code === 200) {
        // Kết quả trả về từ API là một string (stressLevel)
        const stressLevel = result.result || 'UNKNOWN';
        
        // Map stress level to score range (0-100%)
        let stressScore = 0;
        let displayLevel = '';
        
        // Phân tích dựa trên kết quả thực tế từ API
        switch (stressLevel) {
          case 'Extreme Stress': 
            stressScore = 95; 
            displayLevel = 'Cực kỳ căng thẳng';
            break;
          case 'High Stress': 
            stressScore = 80; 
            displayLevel = 'Căng thẳng cao';
            break;
          case 'Moderate Stress': 
            stressScore = 65; 
            displayLevel = 'Căng thẳng trung bình';
            break;
          case 'Mild Stress': 
            stressScore = 40; 
            displayLevel = 'Căng thẳng nhẹ';
            break;
          case 'Normal': 
            stressScore = 20; 
            displayLevel = 'Bình thường';
            break;
          case 'Relaxed': 
            stressScore = 5; 
            displayLevel = 'Thư giãn';
            break;
          case 'No face detected!':
            stressScore = 0;
            displayLevel = 'Không phát hiện khuôn mặt';
            break;
          default: 
            stressScore = 0;
            displayLevel = `Không xác định (${stressLevel})`;
        }
        
        // Create analysis object
        const newAnalysis = {
          id: Date.now().toString(),
          stressScore: stressScore,
          stressLevel: stressLevel,
          displayLevel: displayLevel,
          createdAt: new Date()
        };
        
        // Thêm vào console để kiểm tra
        console.log('Phân tích stress:', { stressLevel, stressScore, displayLevel, result });
        
        // Chỉ lưu kết quả nếu phát hiện được khuôn mặt
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
              showNotification('Mức độ căng thẳng của bạn đang ở mức cao liên tục! Hãy nghỉ ngơi và thư giãn!');
              setHighStressCount(0); // Reset counter after notification
            }
          } else {
            // Reset counter if not high stress
            setHighStressCount(0);
          }
        } else {
          // Hiển thị cảnh báo nhẹ khi không phát hiện khuôn mặt
          setError('Không phát hiện được khuôn mặt, vui lòng điều chỉnh vị trí webcam');
        }
      } else {
        console.error('Lỗi phân tích ảnh:', result);
        setError('Không thể phân tích ảnh. Vui lòng thử lại sau.');
        setHighStressCount(0); // Reset counter on error
      }
    } catch (err) {
      console.error('Error analyzing stress level:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
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
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Theo dõi mức độ căng thẳng liên tục</h2>
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
              Đang xử lý...
            </span>
          ) : isMonitoring ? 'Dừng theo dõi' : 'Bắt đầu theo dõi'}
        </button>
      </div>
      
      {!isMonitoring && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
          <h3 className="font-medium text-blue-700 mb-1">Hướng dẫn sử dụng:</h3>
          <ul className="list-disc pl-5 text-sm text-blue-800">
            <li>Nhấn "Bắt đầu theo dõi" để kích hoạt camera và bắt đầu phân tích mức độ căng thẳng</li>
            <li>Đảm bảo khuôn mặt bạn được nhìn thấy rõ ràng trên camera</li>
            <li>Hệ thống sẽ phân tích mức độ căng thẳng mỗi 3 giây</li>
            <li>Nếu phát hiện {CONSECUTIVE_HIGH_COUNT} lần liên tiếp có mức độ căng thẳng {'>'} {HIGH_STRESS_THRESHOLD}%, bạn sẽ nhận được thông báo</li>
            <li>Khi hoàn thành, nhấn "Dừng theo dõi" để tắt camera</li>
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
          Đang chụp và phân tích mỗi 3 giây...
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
              Hệ thống đang chụp và phân tích mức độ căng thẳng của bạn. Bạn sẽ nhận được cảnh báo khi mức độ căng thẳng vượt quá {HIGH_STRESS_THRESHOLD}% trong {CONSECUTIVE_HIGH_COUNT} lần liên tiếp.
            </p>
            {highStressCount > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Cảnh báo: Đã phát hiện {highStressCount}/{CONSECUTIVE_HIGH_COUNT} lần căng thẳng cao liên tiếp
                </p>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-700 mb-2">Các chỉ số gần đây:</h3>
          
          {recentStressLevels.length === 0 ? (
            <p className="text-gray-500 italic">Chưa có dữ liệu căng thẳng nào. Đang chờ phân tích...</p>
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
                    Mức độ: {reading.displayLevel || reading.stressLevel}
                    {reading.stressScore > HIGH_STRESS_THRESHOLD && (
                      <span className="ml-2 text-red-500 font-medium">⚠️ Cao</span>
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
          <h3 className="text-lg font-semibold mb-2">Kết quả gần đây</h3>
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
          <h3 className="text-lg font-semibold mb-2">Kết quả gần đây</h3>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
            <p className="text-lg font-medium text-gray-500">No Data</p>
            <p className="text-sm text-gray-400 mt-1">Chưa có kết quả phân tích nào</p>
          </div>
        </div>
      ) : null}
    </div>
  );
} 