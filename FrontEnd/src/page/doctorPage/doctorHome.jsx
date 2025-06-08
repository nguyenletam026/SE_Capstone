import React, { useEffect, useState } from "react";
import {
  getPendingChatRequests,
  acceptChatRequest,
  rejectChatRequest,
} from "../../lib/doctor/doctorServices";
import Img from "../../assets/2.png";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 min-h-full bg-gray-50 flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-100 px-6 md:px-12 py-6 rounded-xl shadow-md mt-4 mb-12">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between h-56 md:h-72">
    {/* Left: Text */}
    <div className="md:w-1/2 pr-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Manage appointments easily
      </h1>
      <p className="text-base text-gray-700">
        
Quickly engage with patients and maintain healthcare connections.
      </p>
    </div>

    {/* Right: Image */}
    <div className="md:w-1/2 mt-6 md:mt-0 md:ml-8 flex justify-center">
      <img
        src={Img}
        alt="Doctor"
        className="max-h-44 w-auto object-contain rounded-lg shadow"
      />
    </div>
  </div>
</section>

        {/* Request Section
        <section className="px-6 md:px-24 pb-16">
          <h2 className="text-3xl font-semibold text-center mb-10 text-blue-800">📝 Yêu cầu đang chờ</h2>
          {requests.length === 0 ? (
            <p className="text-center text-gray-500">Hiện chưa có yêu cầu nào.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {requests.map((req) => (
                <div
                  key={req.requestId}
                  className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center transition hover:scale-[1.01]"
                >
                  <img
                    src={req.patientAvatar || "https://via.placeholder.com/80"}
                    alt={req.patientName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 mb-4"
                  />
                  <p className="font-bold text-lg text-gray-800 mb-1">{req.patientName}</p>
                  <p className="text-sm text-gray-500 mb-4">{new Date(req.createdAt).toLocaleString()}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAccept(req.requestId)}
                      disabled={processingId === req.requestId}
                      className="px-5 py-2 text-sm rounded-full bg-green-500 hover:bg-green-600 text-white font-medium transition"
                    >
                      {processingId === req.requestId ? "Đang xử lý..." : "Chấp nhận"}
                    </button>
                    <button
                      onClick={() => handleReject(req.requestId)}
                      disabled={processingId === req.requestId}
                      className="px-5 py-2 text-sm rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section> */}
      </main>

      
    </div>
  );
}
