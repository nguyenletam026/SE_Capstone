import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllDoctorRecommend } from "../../lib/user/assessmentServices";
import { requestChatWithDoctor, createChatPayment } from "../../lib/util/chatServices";

export default function UserContactDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hours, setHours] = useState(1);
  const [totalAmount, setTotalAmount] = useState(100000); // 100,000 VND per hour

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await getAllDoctorRecommend();
        const found = res.result.find((d) => d.id === id);
        setDoctor(found);
      } catch (err) {
        console.error("Failed to load doctor details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    setTotalAmount(hours * 100000);
  }, [hours]);

  const handleRequestChat = async () => {
    setRequesting(true);
    try {
      console.log('Creating payment with:', { doctorId: id, hours });
      // Create payment first
      const paymentRes = await createChatPayment(id, hours);
      
      // Then create chat request
      await requestChatWithDoctor(id);
      
      alert("Đã gửi yêu cầu trò chuyện và thanh toán thành công!");
      navigate("/home");
    } catch (err) {
      console.error("Failed to request chat or make payment", err);
      // Check if the error has a specific message
      const errorMessage = err.response?.data?.message || err.message || "Đã có lỗi xảy ra khi gửi yêu cầu hoặc thanh toán.";
      alert(errorMessage);
    } finally {
      setRequesting(false);
    }
  };

  const handleBack = () => navigate("/assessment/recommend");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brown-700"></div>
      </div>
    );
  }

  if (!doctor) {
    return <p className="text-center p-8">Không tìm thấy thông tin bác sĩ.</p>;
  }

  return (
    <div className="min-h-screen bg-yellow-100 p-6 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow max-w-md w-full">
        <div className="flex flex-col items-center">
          <img
            src={doctor.avtUrl || "https://via.placeholder.com/100"}
            alt="Doctor Avatar"
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
          <h2 className="text-xl font-bold mb-2">
            {doctor.lastName} {doctor.firstName}
          </h2>
          <p className="text-gray-600 mb-1">Email: {doctor.username}</p>
          <p className="text-gray-500 text-sm mb-6">
            Ngày sinh: {new Date(doctor.birthdayDate).toLocaleDateString()}
          </p>

          {/* Payment Section */}
          <div className="w-full mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Chi phí tư vấn</h3>
            <p className="text-sm text-gray-600 mb-2">Giá: 100,000 VND/giờ</p>
            
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium">Số giờ:</label>
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="border rounded px-2 py-1"
                disabled={requesting}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>
                    {h} giờ
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium">
                Tổng tiền: {totalAmount.toLocaleString()} VND
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestChat}
            disabled={requesting}
            className="bg-brown-700 hover:bg-brown-800 text-white font-semibold px-6 py-2 rounded-full shadow hover:shadow-md transition-all w-full mb-3 disabled:opacity-50"
          >
            {requesting ? "Đang xử lý..." : "Thanh toán và gửi yêu cầu"}
          </button>

          <button
            onClick={handleBack}
            className="text-sm font-medium text-brown-700 hover:underline transition"
          >
            ← Chọn bác sĩ khác
          </button>
        </div>
      </div>
    </div>
  );
}
