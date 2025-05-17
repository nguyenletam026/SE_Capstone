import React, { useEffect, useState } from "react";
import { getDailyStress } from "../../lib/user/stressServices";
import WebcamCapture from "../utils/WebcamCapture";
import Bot from "../../assets/4.png";
import Modal from "react-modal";

export default function StressHomeSection({ onRefreshCharts }) {
  const [bgColor, setBgColor] = useState("#9BB168");
  const [showWebcam, setShowWebcam] = useState(false);
  const [stressLevel, setStressLevel] = useState(null);
  const [stressScore, setStressScore] = useState(100);

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
          setBgColor("#ef4444"); //red
        } else if (score > 40) {
          setBgColor("#eab308"); //yellow
        } else {
          setBgColor("#9BB168");  //green
        }
      }
    }
  };

  const getStressIcon = () => {
    if (stressScore > 70) return <span className="text-6xl">😟</span>;
    if (stressScore > 40) return <span className="text-6xl">😐</span>;
    return <span className="text-6xl">😊</span>;
  };

  <div className="flex justify-center">
    <div className="max-w-[100%] w-full h-[320px] overflow-hidden rounded-lg shadow">
      <WebcamCapture
        onResult={() => {
          refreshDailyStress();
          setShowWebcam(false);
          onRefreshCharts();
        }}
      />
    </div>
  </div>

  return (
    <div
      className="relative text-white text-center pb-24 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div className="pt-6">
        <p className="text-sm font-semibold uppercase">Xin Chào Người Dùng</p>
        <p className="text-xs underline mb-4 cursor-pointer">Thiết Lập Profile</p>
        <p className="text-6xl font-bold">{stressScore}</p>
        <div className="flex justify-center">{getStressIcon()}</div>
        <p className="mt-2 font-bold text-lg">
          {stressLevel ? `Bạn Đang Có Tâm Trạng: ${stressLevel}` : "Đang tải..."}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <img
          src={Bot}
          alt="Bot"
          className="w-40 h-40 relative z-0"
          style={{ pointerEvents: "none" }}
        />
      </div>

      <div className="mt-6">
        <button
          onClick={() => setShowWebcam(true)}
          className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
        >
          Bắt Đầu Phân Tích Bằng Camera 📸
        </button>

        <Modal
          isOpen={showWebcam}
          onRequestClose={() => setShowWebcam(false)}
          contentLabel="Phân tích stress qua camera"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl mt-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-3xl relative">

            <h2 className="text-xl font-bold mb-2 text-center">
              Phân tích stress qua camera
            </h2>

            <WebcamCapture
              onResult={() => {
                refreshDailyStress();
                setShowWebcam(false);
                onRefreshCharts();
              }}
            />

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowWebcam(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Thoát Chế Độ Camera ❌
              </button>
            </div>
          </div>
        </Modal>
      </div>

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
