import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { getAllVideoRecommend } from "../../lib/util/videoMusicRecommend";
import { FiUpload, FiTrash2, FiX, FiVideo } from "react-icons/fi";
import { getToken } from "../../services/localStorageService";

export default function AdminVideoManage() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await getAllVideoRecommend();
      if (res.code === 1000) {
        setVideos(res.result);
      }
    } catch (error) {
      console.error("❌ Error fetching video list:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.name) {
      alert("Please select a video file and enter the video name!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("video", uploadData.file);
    formData.append("name", uploadData.name);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/recommend-video/MODERATE_STRESS`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Video uploaded successfully!");
        setIsUploadModalOpen(false);
        setUploadData({ file: null, name: "" });
        fetchVideos();
      } else {
        alert("Error uploading video!");
      }
    } catch (error) {
      console.error("❌ Error uploading video:", error);
      alert("Error uploading video!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (videoUrl) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/delete-video`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (response.ok) {
        alert("Video deleted successfully!");
        fetchVideos();
      } else {
        alert("Error deleting video!");
      }
    } catch (error) {
      console.error("❌ Error deleting video:", error);
      alert("Error deleting video!");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🎥 Manage Stress Relief Videos</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiUpload />
          Add New Video
        </button>
      </div>

      {videos.length === 0 ? (
        <p className="text-gray-500">No videos available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-2xl p-6 flex flex-col items-start space-y-3 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FiVideo className="w-6 h-6 text-blue-500" />
                  <h3 className="font-semibold text-gray-800 truncate max-w-[80%]">
                    {video.videoName}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(video.videoUrl)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition font-medium w-full"
                onClick={() => setSelectedVideo(video.videoUrl)}
              >
                🎬 Watch Video
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal xem video */}
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

      {/* Modal upload video */}
      <Dialog
        open={isUploadModalOpen}
        onClose={() => !isLoading && setIsUploadModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Video</h2>
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
                Video Name
              </label>
              <input
                type="text"
                value={uploadData.name}
                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video name"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white py-2 rounded-md font-medium ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 transition-colors"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Upload Video"}
            </button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
