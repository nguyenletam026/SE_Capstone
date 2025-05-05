import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { getAllVideoRecommend } from "../../lib/util/videoMusicRecommend";

export default function AdminVideoManage() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await getAllVideoRecommend();
        if (res.code === 1000) {
          setVideos(res.result);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách video:", error);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🎥 Quản lý video gợi ý stress</h1>

      {videos.length === 0 ? (
        <p className="text-gray-500">Không có video nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-6 flex flex-col items-start space-y-3 transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4.5 3A1.5 1.5 0 003 4.5v11A1.5 1.5 0 004.5 17h11a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0015.5 3h-11zm4.75 3.75l5.25 3-5.25 3v-6z" />
                </svg>
                <h3 className="font-semibold text-gray-800 truncate max-w-[80%]">
                  {video.videoName}
                </h3>
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition font-medium"
                onClick={() => setSelectedVideo(video.videoUrl)}
              >
                🎬 Xem video
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup xem video */}
      {selectedVideo && (
        <Dialog
          open={true}
          onClose={() => setSelectedVideo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full mx-4">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-red-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <video
              src={selectedVideo}
              controls
              className="w-full max-h-[80vh] rounded object-contain"
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
