import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { getAllMusicRecommend } from "../../lib/util/videoMusicRecommend";
import { FiUpload, FiTrash2, FiX, FiMusic } from "react-icons/fi";
import { getToken } from "../../services/localStorageService";

export default function AdminMusicManage() {
  const [musics, setMusics] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMusics();
  }, []);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.name) {
      alert("Vui lòng chọn file nhạc và nhập tên bài hát!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("music", uploadData.file);
    formData.append("name", uploadData.name);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/recommend/MILD_STRESS`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Upload nhạc thành công!");
        setIsUploadModalOpen(false);
        setUploadData({ file: null, name: "" });
        fetchMusics();
      } else {
        alert("Lỗi khi upload nhạc!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi upload nhạc:", error);
      alert("Lỗi khi upload nhạc!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (musicUrl) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài hát này?")) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/delete-music`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ musicUrl }),
      });

      if (response.ok) {
        alert("Xóa bài hát thành công!");
        fetchMusics();
      } else {
        alert("Lỗi khi xóa bài hát!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi xóa bài hát:", error);
      alert("Lỗi khi xóa bài hát!");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎵 Quản lý nhạc gợi ý stress</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiUpload />
          Thêm nhạc mới
        </button>
      </div>

      {musics.length === 0 ? (
        <p className="text-gray-500">Không có bản nhạc nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {musics.map((music, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-6 flex flex-col items-start space-y-3 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FiMusic className="w-6 h-6 text-green-500" />
                  <h3 className="font-semibold text-gray-800 truncate max-w-[80%]">
                    {music.recommendName}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(music.recommendUrl)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition font-medium w-full"
                onClick={() => setSelectedMusic(music.recommendUrl)}
              >
                🎧 Nghe nhạc
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal nghe nhạc */}
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

      {/* Modal upload nhạc */}
      <Dialog
        open={isUploadModalOpen}
        onClose={() => !isLoading && setIsUploadModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Thêm nhạc mới</h2>
            <button
              onClick={() => !isLoading && setIsUploadModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bài hát
              </label>
              <input
                type="text"
                value={uploadData.name}
                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập tên bài hát"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File nhạc
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-green-500 text-white py-2 rounded-md font-medium ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-600 transition-colors"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Upload nhạc"}
            </button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
