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
      <h1 className="text-2xl font-bold mb-4">Quản lý nhạc gợi ý stress</h1>

      {musics.length === 0 ? (
        <p className="text-gray-500">Không có bản nhạc nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {musics.map((music, idx) => (
            <div key={idx} className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold mb-2">{music.recommendName}</h3>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => setSelectedMusic(music.recommendUrl)}
              >
                Nghe nhạc
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup nghe nhạc */}
      {selectedMusic && (
        <Dialog open={true} onClose={() => setSelectedMusic(null)} className="fixed z-50 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
            <div className="flex justify-end">
              <button onClick={() => setSelectedMusic(null)} className="text-red-500 text-xl font-bold">×</button>
            </div>
            <audio src={selectedMusic} controls className="w-full mt-4" />
          </div>
        </Dialog>
      )}
    </div>
  );
}
