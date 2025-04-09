import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaCamera } from 'react-icons/fa';

export default function FaceLogin({ username }) {
  const videoRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const captureAndAuthenticate = async () => {
    if (!username) {
      setError('Please enter your username first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Tạo video element ẩn
      const video = document.createElement('video');
      video.style.display = 'none';
      document.body.appendChild(video);

      // Lấy stream từ camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      
      // Đợi video sẵn sàng
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      // Đợi 1 giây để camera focus
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Chụp ảnh
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Dừng camera và xóa video element
      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(video);

      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      
      // Create form data
      const formData = new FormData();
      formData.append('username', username);
      formData.append('file_target', blob);

      // Send to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth-face`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.result?.token) {
        login(data.result.token);
        const decoded = jwtDecode(data.result.token);
        if (decoded.scope === "ROLE_ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/home");
        }
      } else {
        setError('Face authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('Error during face authentication:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        onClick={captureAndAuthenticate}
        disabled={isProcessing}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-black text-white hover:bg-gray-900'
        }`}
      >
        <FaCamera className="text-xl" />
        {isProcessing ? 'Authenticating...' : 'Authenticate with Face ID'}
      </button>
    </div>
  );
} 