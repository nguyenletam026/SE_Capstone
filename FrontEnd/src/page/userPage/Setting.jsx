import React, { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState("on");
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("vi");
  const [saving, setSaving] = useState(false);
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      alert("Settings saved successfully!");
      setSaving(false);
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-200 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8">        <h2 className="text-2xl sm:text-3xl font-bold text-brown-700 mb-4 sm:mb-6 text-center">Account Settings</h2>
        <p className="text-gray-600 mb-6 sm:mb-8 text-center text-xs sm:text-sm">
          Customize your experience settings to suit your usage needs.
        </p>

        <div className="space-y-4 sm:space-y-6">
          <div>            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Notifications</label>
            <select
              className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#9BB168] text-sm sm:text-base"
              value={notifications}
              onChange={(e) => setNotifications(e.target.value)}
            >
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </div>

          <div>            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Interface Mode</label>
            <select
              className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#9BB168] text-sm sm:text-base"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Language</label>
            <select
              className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-[#9BB168] text-sm sm:text-base"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="vi">Vietnamese</option>
              <option value="en">English</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full bg-[#9BB168] text-white font-semibold py-2 sm:py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg hover:bg-green-700 text-sm sm:text-base ${saving && "opacity-50"}`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}