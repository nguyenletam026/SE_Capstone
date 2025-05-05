import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react"; // hoặc bạn có thể dùng modal từ bất kỳ UI lib nào
import { getAllRecommendedVideos } from "../../lib/util/videoMusicRecommend";

export default function AdminVideoManage() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await getAllRecommendedVideos();
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý video gợi ý stress</h1>

      {videos.length === 0 ? (
        <p className="text-gray-500">Không có video nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, idx) => (
            <div key={idx} className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">{video.videoName}</h3>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setSelectedVideo(video.videoUrl)}
              >
                Xem video
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup xem video */}
      {selectedVideo && (
        <Dialog open={true} onClose={() => setSelectedVideo(null)} className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full">
            <div className="flex justify-end">
              <button onClick={() => setSelectedVideo(null)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <video src={selectedVideo} controls className="w-full rounded" />
          </div>
        </Dialog>
      )}
    </div>
  );
}
