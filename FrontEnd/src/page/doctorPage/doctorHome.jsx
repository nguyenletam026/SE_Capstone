import React, { useEffect, useState } from "react";
import {
  getPendingChatRequests,
  acceptChatRequest,
  rejectChatRequest,
} from "../../lib/doctor/doctorServices";

export default function DoctorHome() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await getPendingChatRequests();
      setRequests(res.result);
    } catch (err) {
      console.error("Failed to fetch chat requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      await acceptChatRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to accept chat request:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await rejectChatRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to reject chat request:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brown-700"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bác Sĩ Dashboard</h1>
          <p className="text-sm">Xin chào! Hãy chăm sóc bệnh nhân một cách tận tâm 💙</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-100 py-12 px-6 md:px-20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Quản lý các cuộc hẹn dễ dàng
              </h1>
              <p className="text-lg mb-6">
                Tương tác nhanh chóng với bệnh nhân và duy trì kết nối chăm sóc sức khỏe.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://cdn.pixabay.com/photo/2016/03/31/19/56/doctor-1295556_1280.png"
                alt="Doctor Illustration"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Request Section */}
        <section className="bg-white py-12 px-6 md:px-20">
          <h2 className="text-3xl font-semibold mb-8 text-center text-brown-700">Yêu cầu đang chờ</h2>
          {requests.length === 0 ? (
            <p className="text-center text-gray-600">Hiện chưa có yêu cầu nào.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {requests.map((req) => (
                <div
                  key={req.requestId}
                  className="bg-gray-50 border p-6 rounded-lg shadow flex flex-col items-center"
                >
                  <img
                    src={req.patientAvatar || "https://via.placeholder.com/80"}
                    alt={req.patientName}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                  <p className="font-semibold text-gray-800 mb-1">{req.patientName}</p>
                  <p className="text-sm text-gray-600 mb-2">{new Date(req.createdAt).toLocaleString()}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAccept(req.requestId)}
                      disabled={processingId === req.requestId}
                      className="px-4 py-2 text-sm rounded-full bg-green-600 text-white hover:bg-green-700"
                    >
                      {processingId === req.requestId ? "Đang xử lý..." : "Chấp nhận"}
                    </button>
                    <button
                      onClick={() => handleReject(req.requestId)}
                      disabled={processingId === req.requestId}
                      className="px-4 py-2 text-sm rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm py-4 text-gray-600">
        © 2025 Student Stress Helper - Hệ thống hỗ trợ sức khỏe tinh thần
      </footer>
    </div>
  );
}
