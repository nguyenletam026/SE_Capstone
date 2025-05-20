import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyFaceAuth, setFaceAuthStatus } from '../../lib/doctor/faceAuthService';
import { FaCamera, FaIdCard, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const FaceAuthVerification = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [idCardPreview, setIdCardPreview] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState(true);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // Khởi tạo camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setCameraPermission(true);
      } catch (err) {
        console.error('Không thể truy cập camera:', err);
        setCameraPermission(false);
        setError('Không thể truy cập camera. Vui lòng cấp quyền truy cập và thử lại.');
      }
    };

    startCamera();

    // Dọn dẹp khi component unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Xử lý video được quay
  useEffect(() => {
    if (recordedChunks.length > 0 && !recording) {
      try {
        const blob = new Blob(recordedChunks, { type: 'video/mp4' });
        const file = new File([blob], 'face-verification.mp4', { type: 'video/mp4' });
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Lỗi khi xử lý video:', err);
        setError('Đã xảy ra lỗi khi xử lý video. Vui lòng thử lại.');
      }
    }
  }, [recordedChunks, recording]);

  // Xử lý đếm ngược khi quay
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && recording) {
      stopRecording();
    }

    return () => clearTimeout(timer);
  }, [countdown, recording]);

  // Bắt đầu quay video
  const startRecording = () => {
    setError('');
    setRecordedChunks([]);
    
    if (streamRef.current) {
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks((prev) => [...prev, event.data]);
          }
        };
        
        mediaRecorder.onstop = () => {
          setRecording(false);
        };
        
        mediaRecorder.onerror = (event) => {
          console.error('Lỗi MediaRecorder:', event.error);
          setError('Đã xảy ra lỗi khi quay video. Vui lòng thử lại.');
          setRecording(false);
        };
        
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
        setCountdown(5); // Đếm ngược 5 giây
      } catch (err) {
        console.error('Lỗi khi bắt đầu quay:', err);
        setError('Không thể bắt đầu quay video. Vui lòng thử lại.');
      }
    } else {
      setError('Không thể truy cập camera. Vui lòng làm mới trang và cấp quyền truy cập.');
    }
  };

  // Dừng quay video
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Lỗi khi dừng quay:', err);
        setError('Đã xảy ra lỗi khi dừng quay video.');
        setRecording(false);
      }
    }
  };

  // Xử lý khi chọn file CMND
  const handleIdCardChange = (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh hợp lệ.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
        setError('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
        return;
      }
      
      setIdCardFile(file);
      setIdCardPreview(URL.createObjectURL(file));
    }
  };

  // Gửi yêu cầu xác thực
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile || !idCardFile) {
      setError('Vui lòng quay video khuôn mặt và tải lên hình ảnh CMND/CCCD.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Thiết lập timeout cho API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );
      
      const responsePromise = verifyFaceAuth(videoFile, idCardFile);
      
      // Chạy cả hai promise và lấy kết quả của promise nào hoàn thành trước
      const response = await Promise.race([responsePromise, timeoutPromise]);
      
      setResult(response);
      
      if (response.success) {
        setFaceAuthStatus(true);
        // Chuyển đến trang chính sau 2 giây
        setTimeout(() => {
          navigate('/doctor-home');
        }, 2000);
      } else {
        setFaceAuthStatus(false);
      }
    } catch (err) {
      console.error('Lỗi xác thực:', err);
      setResult({
        success: false,
        message: err.message === 'Timeout' 
          ? 'Quá thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại sau.'
          : 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setVideoFile(null);
    setIdCardFile(null);
    setVideoPreview('');
    setIdCardPreview('');
    setRecordedChunks([]);
    setResult(null);
    setError('');
  };

  // Thử lại khi gặp lỗi camera
  const handleRetryCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setCameraPermission(true);
    } catch (err) {
      console.error('Không thể truy cập camera:', err);
      setCameraPermission(false);
      setError('Không thể truy cập camera. Vui lòng cấp quyền truy cập và thử lại.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Xác thực khuôn mặt
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Vui lòng quay video khuôn mặt và tải lên hình ảnh CMND/CCCD để tiếp tục.
      </p>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Video camera */}
        <div className="flex flex-col items-center">
          <div className="border-2 border-blue-400 rounded-lg overflow-hidden w-full aspect-video mb-3 bg-gray-100 relative">
            {!cameraPermission ? (
              <div className="w-full h-full flex items-center justify-center p-4 text-center">
                <div>
                  <FaExclamationTriangle className="mx-auto text-yellow-500 text-4xl mb-2" />
                  <p className="text-gray-700 mb-4">Không thể truy cập camera</p>
                  <button 
                    onClick={handleRetryCamera}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : !videoPreview ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted 
                  className="w-full h-full object-cover"
                ></video>
                {recording && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">{countdown}</div>
                      <div className="text-sm">Đang quay...</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <video 
                src={videoPreview} 
                controls 
                className="w-full h-full object-cover"
              ></video>
            )}
          </div>
          <button
            type="button"
            onClick={videoPreview ? handleReset : startRecording}
            disabled={!cameraPermission || recording || loading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              !cameraPermission 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : videoPreview 
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {recording ? (
              <FaSpinner className="animate-spin" />
            ) : videoPreview ? (
              <>
                <FaTimesCircle /> Quay lại
              </>
            ) : (
              <>
                <FaCamera /> Quay video (5s)
              </>
            )}
          </button>
        </div>

        {/* CMND upload */}
        <div className="flex flex-col items-center">
          <div 
            className="border-2 border-blue-400 border-dashed rounded-lg overflow-hidden w-full aspect-video mb-3 bg-gray-100 flex items-center justify-center"
          >
            {idCardPreview ? (
              <img 
                src={idCardPreview} 
                alt="CMND/CCCD" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4">
                <FaIdCard className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500">Tải lên hình ảnh CMND/CCCD</p>
                <p className="text-xs text-gray-400 mt-2">Định dạng: JPG, PNG, etc. (tối đa 5MB)</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 cursor-pointer">
              <FaIdCard /> {idCardFile ? 'Đổi ảnh khác' : 'Chọn ảnh CMND/CCCD'}
              <input
                type="file"
                accept="image/*"
                onChange={handleIdCardChange}
                disabled={loading}
                className="hidden"
              />
            </label>
            {idCardFile && (
              <button
                onClick={() => {
                  setIdCardFile(null);
                  setIdCardPreview('');
                }}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                disabled={loading}
              >
                <FaTimesCircle />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result message */}
      {result && (
        <div className={`mb-6 p-4 rounded-lg ${
          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
            ) : (
              <FaTimesCircle className="text-red-500 text-xl flex-shrink-0" />
            )}
            <p>{result.message}</p>
          </div>
          {!result.success && (
            <button
              onClick={handleReset}
              className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!videoFile || !idCardFile || loading || result?.success}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
            (!videoFile || !idCardFile || loading || result?.success)
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Đang xác thực...
            </>
          ) : result?.success ? (
            <>
              <FaCheckCircle /> Đã xác thực thành công
            </>
          ) : (
            'Xác thực khuôn mặt'
          )}
        </button>
      </div>
    </div>
  );
};

export default FaceAuthVerification; 