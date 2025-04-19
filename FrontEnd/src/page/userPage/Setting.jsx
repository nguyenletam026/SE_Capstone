import React, { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState("on");
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("vi");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      alert("Lưu cài đặt thành công!");
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-200 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-brown-700 mb-6 text-center">Cài Đặt Tài Khoản</h2>
        <p className="text-gray-600 mb-8 text-center text-sm">
          Tùy chỉnh các thiết lập trải nghiệm của bạn cho phù hợp với nhu cầu sử dụng.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thông báo</label>
            <select
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BB168]"
              value={notifications}
              onChange={(e) => setNotifications(e.target.value)}
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chế độ giao diện</label>
            <select
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BB168]"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
              <option value="system">Theo hệ thống</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
            <select
              className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BB168]"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full bg-[#9BB168] text-white font-semibold py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg hover:bg-green-700 ${saving && "opacity-50"}`}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}