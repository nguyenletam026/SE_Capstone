// 📁 components/stress/StressHomeSection.jsx
import React, { useEffect, useState } from "react";
import { getDailyStress } from "../../lib/user/stressServices";
import WebcamCapture from "../utils/WebcamCapture";
import Bot from "../../assets/4.png";

export default function StressHomeSection() {
  const [bgColor, setBgColor] = useState("#9BB168");
  const [showWebcam, setShowWebcam] = useState(false);
  const [stressLevel, setStressLevel] = useState(null);
  const [stressScore, setStressScore] = useState(100);

  const refreshDailyStress = async () => {
    const data = await getDailyStress();
    if (data.code === 1000) {
      const today = data.result?.[0];
      const score = today?.average_stress_score ?? 100;
      setStressScore(Math.round(score));
      setStressLevel(today?.dominant_stress_level ?? "Unknown");
      setBgColor((100 - score) < 50 ? "#ef4444" : "#9BB168");
    }
  };

  useEffect(() => {
    refreshDailyStress();
  }, []);

  return (
    <div className="relative text-white text-center pb-24 overflow-hidden" style={{ backgroundColor: bgColor }}>
      <div className="pt-6">
        <p className="text-sm font-semibold uppercase">Xin Chào Người Dùng</p>
        <p className="text-xs underline mb-4 cursor-pointer">Thiết Lập Profile</p>
        <p className="text-6xl font-bold">{stressScore}</p>
        <p className="text-6xl mt-2">😊</p>
        <p className="mt-2 font-bold text-lg">
          {stressLevel ? `Bạn Đang Có Tâm Trạng: ${stressLevel}` : "Đang tải..."}
        </p>
      </div>

      <div className="mt-6 relative z-10 flex justify-center">
        <img src={Bot} alt="Bot" className="w-40 h-40" />
      </div>

      <div className="mt-6">
        {!showWebcam && (
          <button
            onClick={() => setShowWebcam(true)}
            className="bg-white text-brown-700 px-4 py-2 rounded font-semibold"
          >
            Mở Camera Phân Tích
          </button>
        )}

        {showWebcam && (
          <WebcamCapture
            onResult={() => {
              refreshDailyStress();
              setShowWebcam(false);
            }}
          />
        )}
      </div>

      {/* Đường cong đẹp */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[100px]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          d="M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,197.3C672,192,768,160,864,138.7C960,117,1056,107,1152,128C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
}
