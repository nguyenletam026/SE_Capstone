import React, { useEffect, useState } from "react";
import { getDailyStress } from "../../lib/user/stressServices";
import WebcamCapture from "../utils/WebcamCapture";
import Bot from "../../assets/4.png";
import Modal from "react-modal";
import { 
  FaCamera, 
  FaUserCircle, 
  FaSmile, 
  FaMeh, 
  FaFrown, 
  FaTimesCircle, 
  FaChartLine,
  FaLaptopCode,
  FaQuestion
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function StressHomeSection({ onRefreshCharts }) {
  const [bgColor, setBgColor] = useState("from-green-500 to-green-600");
  const [textColor, setTextColor] = useState("text-green-50");
  const [showWebcam, setShowWebcam] = useState(false);
  const [stressLevel, setStressLevel] = useState(null);
  const [stressScore, setStressScore] = useState(100);
  const { user } = useAuth();

  const refreshDailyStress = async () => {
    const data = await getDailyStress();
    if (data.code === 1000) {
      const now = new Date();

      let closestItem = null;
      let smallestDiff = Infinity;

      for (const item of data.result) {
        const endDate = new Date(item.end_date);
        const diff = Math.abs(endDate - now);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestItem = item;
        }
      }

      if (closestItem && closestItem.stress_analyses?.length) {
        let closestEntry = closestItem.stress_analyses[0];
        let smallestCreatedDiff = Math.abs(
          new Date(closestEntry.createdAt) - now
        );

        closestItem.stress_analyses.forEach((entry) => {
          const diff = Math.abs(new Date(entry.createdAt) - now);
          if (diff < smallestCreatedDiff) {
            closestEntry = entry;
            smallestCreatedDiff = diff;
          }
        });

        const score = closestEntry.stressScore ?? 100;
        setStressScore(Math.round(score));
        setStressLevel(closestEntry.stressLevel ?? "Unknown");

        if (score > 70) {
          setBgColor("from-red-500 to-red-600");
          setTextColor("text-red-50");
        } else if (score > 40) {
          setBgColor("from-yellow-400 to-yellow-500");
          setTextColor("text-yellow-50");
        } else {
          setBgColor("from-green-500 to-green-600");
          setTextColor("text-green-50");
        }
      }
    }
  };

  useEffect(() => {
    refreshDailyStress();
  }, []);

  const getStressIcon = () => {
    if (stressScore === null) return <FaQuestion className="text-6xl" />;
    if (stressScore > 70) return <FaFrown className="text-6xl" />;
    if (stressScore > 40) return <FaMeh className="text-6xl" />;
    return <FaSmile className="text-6xl" />;
  };

  const getTimeOfDay = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Buổi Sáng";
    if (hours < 18) return "Buổi Chiều";
    return "Buổi Tối";
  };

  const getUserName = () => {
    return user?.email?.split('@')[0] || "bạn";
  };

  return (
    <div className={`relative text-white pb-20 overflow-hidden bg-gradient-to-r ${bgColor}`}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute right-10 top-20 w-20 h-20 rounded-full bg-white"></div>
        <div className="absolute -right-10 bottom-20 w-40 h-40 rounded-full bg-white"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="pt-8 md:py-12 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <div className="flex items-center mb-3">
              <FaUserCircle className="text-2xl mr-2" />
              <p className={`text-sm font-semibold`}>Xin Chào, <span className="font-bold">{getUserName()}</span>!</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Chúc {getUserName()} Một {getTimeOfDay()} Tốt Lành</h1>
            <p className={`text-sm opacity-80 mb-6 ${textColor}`}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg mb-4">
                <div className="text-center mr-6">
                  <h2 className="text-6xl font-bold">{stressScore !== null ? stressScore : "No Data"}</h2>
                  <p className="text-xs uppercase tracking-wider mt-1 opacity-80">Điểm Số</p>
                </div>
                <div className="flex flex-col items-center">
                  {getStressIcon()}
                  <p className="mt-2 text-sm font-medium text-center">
                    {stressLevel ? stressLevel : "No Data"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWebcam(true)}
                className="flex items-center bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
              >
                <FaCamera className="mr-2" />
                Phân Tích Stress Qua Camera
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-6 md:mt-0">
            <div className="relative">
              <div className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 animate-pulse">
                <FaLaptopCode className="text-xl" />
              </div>
              <div className="absolute -bottom-2 -left-2 bg-white/20 backdrop-blur-sm rounded-full p-2">
                <FaChartLine className="text-lg" />
              </div>
              <img
                src={Bot}
                alt="Bot"
                className="w-48 h-48 md:w-56 md:h-56 relative z-0 drop-shadow-2xl filter-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wave SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,96C960,128,1056,192,1152,186.7C1248,181,1344,107,1392,69.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Modal for WebcamCapture */}
      <Modal
        isOpen={showWebcam}
        onRequestClose={() => setShowWebcam(false)}
        contentLabel="Phân tích stress qua camera"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl mx-4 animate-fadeIn"
      >
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaCamera className="mr-2 text-blue-500" />
              Phân tích stress qua camera
            </h2>
            <button
              onClick={() => setShowWebcam(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimesCircle className="text-xl" />
            </button>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-inner bg-gray-100">
            <WebcamCapture
              onResult={() => {
                refreshDailyStress();
                setShowWebcam(false);
                onRefreshCharts();
              }}
            />
          </div>

          <p className="text-sm text-gray-500 mt-4 mb-6">
            Hãy đảm bảo khuôn mặt của bạn được nhận diện rõ ràng trong khung hình để đạt kết quả chính xác.
          </p>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowWebcam(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300"
            >
              <FaTimesCircle className="mr-2" />
              Đóng Camera
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
