// src/pages/doctor/PendingRequests.jsx

import React, { useEffect, useState } from "react";
import {
  getPendingChatRequests,
  acceptChatRequest,
  rejectChatRequest,
} from "../../lib/doctor/doctorServices";

export default function PendingRequests() {
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
      <div className="flex items-center justify-center min-h-screen bg-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-20 py-10">
      
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
                  className="px-5 py-2 text-sm rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {processingId === req.requestId ? "Đang xử lý..." : "Chấp nhận"}
                </button>
                <button
                  onClick={() => handleReject(req.requestId)}
                  disabled={processingId === req.requestId}
                  className="px-5 py-2 text-sm rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
