import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { getAllMusicRecommend } from "../../lib/util/videoMusicRecommend";

export default function AdminMusicManage() {
  const [musics, setMusics] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        const res = await getAllMusicRecommend();
        if (res.code === 1000) {
          setMusics(res.result);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách nhạc:", error);
      }
    };
    fetchMusics();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎵 Quản lý nhạc gợi ý stress</h1>

      {musics.length === 0 ? (
        <p className="text-gray-500">Không có bản nhạc nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {musics.map((music, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-6 flex flex-col items-start space-y-3 transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2.75a.75.75 0 01.75.75v7.335a2.75 2.75 0 11-1.5-2.415V4.5h-1a.75.75 0 010-1.5h1V3.5a.75.75 0 01.75-.75z" />
                </svg>
                <h3 className="font-semibold text-gray-800 truncate max-w-[80%]">
                  {music.recommendName}
                </h3>
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition font-medium"
                onClick={() => setSelectedMusic(music.recommendUrl)}
              >
                🎧 Nghe nhạc
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup nghe nhạc */}
      {selectedMusic && (
        <Dialog
          open={true}
          onClose={() => setSelectedMusic(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMusic(null)}
                className="text-red-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <audio
              src={selectedMusic}
              controls
              className="w-full mt-4"
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
