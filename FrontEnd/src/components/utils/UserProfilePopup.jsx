import { useState, useRef } from "react";

export default function UserProfilePopup({ currentAvatar, onClose }) {
  const [preview, setPreview] = useState(currentAvatar);
  const fileInputRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    alert("Gửi ảnh lên server tại đây!");
    // TODO: gửi ảnh preview lên server (upload Cloudinary, API, etc.)
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-700">Thông tin cá nhân</h2>

        <div className="flex justify-center mb-6">
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-4 border-blue-300 hover:opacity-80 transition"
            onClick={handleImageClick}
          >
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-xs opacity-0 hover:opacity-100 transition">
              Click để thay ảnh
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
