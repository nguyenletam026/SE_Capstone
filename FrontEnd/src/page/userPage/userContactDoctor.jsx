import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { requestChatWithDoctor, createChatPayment } from "../../lib/util/chatServices";
import { toast } from "react-toastify";
import { getAllDoctorRecommend, getDoctorsByDateTime, getChatCostPerHour, getChatCostPerMinute } from "../../lib/user/assessmentServices";
import { getCurrentBalance } from "../../lib/user/depositServices";
import InlineDepositModal from "../../components/Deposit/InlineDepositModal";

export default function UserContactDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(5);
  const [pricingMode, setPricingMode] = useState('hours'); // 'hours' or 'minutes'
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);  const [paymentMode, setPaymentMode] = useState(false);
  const [costPerHour, setCostPerHour] = useState(100000); // Default value
  const [costPerMinute, setCostPerMinute] = useState(2000); // Default value
  const [loadingCost, setLoadingCost] = useState(true);
  
  // Inline deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  
  // Check if we're coming from an expired chat
  useEffect(() => {
    if (location.state?.expired) {
      setPaymentMode(true);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await getAllDoctorRecommend();
        const foundDoctor = res.result.find(d => d.id === id);
        if (foundDoctor) {
          setDoctor(foundDoctor);
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoadingDoctor(false);
      }
    };

    const fetchBalance = async () => {
      try {
        const data = await getCurrentBalance();
        // Handle the actual response format: {balance: 100000, username: 'demo7@gmail.com'}
        if (data && typeof data.balance === 'number') {
          setUserBalance(data.balance);
        } else if (data && data.result && typeof data.result.balance === 'number') {
          // Fallback for possible alternative format
          setUserBalance(data.result.balance);
        } else {
          console.warn("Định dạng dữ liệu balance không đúng:", data);
          setUserBalance(0); // Giá trị mặc định
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
        setUserBalance(0); // Đặt giá trị mặc định nếu có lỗi
      } finally {
        setLoadingBalance(false);
      }
    };
      const fetchChatCost = async () => {
      try {
        const [hourCost, minuteCost] = await Promise.all([
          getChatCostPerHour(),
          getChatCostPerMinute()
        ]);
        setCostPerHour(hourCost);
        setCostPerMinute(minuteCost);
        console.log("Chat cost per hour:", hourCost);
        console.log("Chat cost per minute:", minuteCost);
      } catch (err) {
        console.error("Error fetching chat costs:", err);
        // Keep the default costs
      } finally {
        setLoadingCost(false);
      }
    };

    fetchDoctor();
    fetchBalance();
    fetchChatCost();
  }, [id]);

  const handleStartChat = async () => {
    setLoading(true);
    try {
      await requestChatWithDoctor(id);
      toast.success("Yêu cầu đã được gửi! Bạn có thể bắt đầu trò chuyện ngay.");
      
      // Format doctor for chat and navigate to chat page
      const doctorToChat = {
        doctorId: id,
        doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Bác sĩ",
        doctorAvatar: doctor?.avtUrl
      };
      
      // Navigate to chat page with doctor info
      navigate("/chatroom", { 
        state: { 
          doctorToChat,
          fromPayment: false  // No payment was made
        } 
      });
    } catch (err) {
      console.error("Error requesting chat:", err);
      
      // Handle specific error cases
      if (err.message && err.message.includes("already been processed")) {
        // If the request already exists, just navigate to the chat
        toast.info("Bạn đã có thể trò chuyện với bác sĩ này.");
        
        const doctorToChat = {
          doctorId: id,
          doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Bác sĩ",
          doctorAvatar: doctor?.avtUrl
        };
        
        navigate("/chatroom", { 
          state: { 
            doctorToChat,
            fromPayment: false 
          } 
        });
      } else {
        toast.error(err.message || "Không thể gửi yêu cầu trò chuyện");
      }
    } finally {
      setLoading(false);
    }
  };
    const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await createChatPayment(
        id, 
        pricingMode === 'hours' ? hours : 1, // Default to 1 hour for backward compatibility
        pricingMode === 'minutes' ? minutes : null
      );
      
      const durationText = pricingMode === 'hours' 
        ? `${hours} giờ` 
        : `${minutes} phút`;
      
      toast.success(`Thanh toán thành công! Bạn có thể trò chuyện với bác sĩ trong ${durationText}.`);
      
      // Format doctor for chat and navigate to chat page
      const doctorToChat = {
        doctorId: id,
        doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Bác sĩ",
        doctorAvatar: doctor?.avtUrl
      };
      
      // Navigate to chat page with doctor info and payment flag
      navigate("/chatroom", { 
        state: { 
          doctorToChat,
          fromPayment: true  // Add flag to indicate we just came from a payment
        } 
      });    } catch (err) {
      console.error("Error making payment:", err);
      
      if (err.message && err.message.includes("Số dư không đủ")) {
        // Show inline deposit modal instead of redirecting
        setShowDepositModal(true);
      } else {
        toast.error(err.message || "Không thể thanh toán. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle successful deposit
  const handleDepositSuccess = async (depositedAmount) => {
    // Update balance
    try {
      const data = await getCurrentBalance();
      if (data && typeof data.balance === 'number') {
        setUserBalance(data.balance);
      }
    } catch (err) {
      console.error("Error refreshing balance:", err);
    }

    setShowDepositModal(false);
    toast.success(`Nạp tiền thành công! Số dư mới: ${depositedAmount.toLocaleString('vi-VN')} VND`);
    
    // Automatically retry payment after successful deposit
    setTimeout(() => {
      handlePayment();
    }, 1000);
  };

  if (loadingDoctor || loadingBalance || loadingCost) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalCost = pricingMode === 'hours' 
    ? hours * costPerHour 
    : minutes * costPerMinute;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          {paymentMode ? "Thanh toán phí tư vấn" : "Kết nối với bác sĩ"}
        </h2>
        
        {doctor && (
          <div className="mb-6">
            <img 
              src={doctor.avtUrl || "/default-avatar.png"} 
              alt={`${doctor.firstName} ${doctor.lastName}`}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
            />
            <h3 className="text-xl font-semibold">{doctor.firstName} {doctor.lastName}</h3>
          </div>
        )}
        
        {paymentMode ? (
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Phiên chat đã hết hạn. Vui lòng thanh toán để tiếp tục trò chuyện với bác sĩ.
            </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Số dư hiện tại:</span>
                <span className="font-medium">{(userBalance || 0).toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Giá mỗi giờ:</span>
                <span className="font-medium">{(costPerHour || 0).toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Giá mỗi phút:</span>
                <span className="font-medium">{(costPerMinute || 0).toLocaleString()} VND</span>
              </div>
            </div>

            {/* Pricing Mode Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-3 font-medium">Chọn phương thức tính phí:</label>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setPricingMode('hours')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    pricingMode === 'hours'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Theo giờ</div>
                    <div className="text-sm opacity-75">{costPerHour.toLocaleString()} VND/giờ</div>
                  </div>
                </button>
                <button
                  onClick={() => setPricingMode('minutes')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    pricingMode === 'minutes'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Theo phút</div>
                    <div className="text-sm opacity-75">{costPerMinute.toLocaleString()} VND/phút</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Duration Selection */}
            {pricingMode === 'hours' ? (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Số giờ tư vấn:</label>
                <div className="flex items-center justify-center">
                  <button 
                    onClick={() => hours > 1 && setHours(hours - 1)}
                    className="px-4 py-3 sm:px-3 sm:py-1 bg-gray-200 rounded-l-lg hover:bg-gray-300 active:bg-gray-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-lg sm:text-base"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 sm:px-4 sm:py-1 bg-gray-100 border-t border-b min-h-[44px] flex items-center justify-center text-lg sm:text-base font-medium">
                    {hours || 1}
                  </span>
                  <button 
                    onClick={() => setHours(hours + 1)}
                    className="px-4 py-3 sm:px-3 sm:py-1 bg-gray-200 rounded-r-lg hover:bg-gray-300 active:bg-gray-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-lg sm:text-base"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Số phút tư vấn:</label>                <div className="flex items-center justify-center">
                  <button 
                    onClick={() => minutes > 5 && setMinutes(minutes - 5)}
                    className="px-4 py-3 sm:px-3 sm:py-1 bg-gray-200 rounded-l-lg hover:bg-gray-300 active:bg-gray-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-lg sm:text-base"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 sm:px-4 sm:py-1 bg-gray-100 border-t border-b min-h-[44px] flex items-center justify-center text-lg sm:text-base font-medium">
                    {minutes || 5}
                  </span>
                  <button 
                    onClick={() => setMinutes(minutes + 5)}
                    className="px-4 py-3 sm:px-3 sm:py-1 bg-gray-200 rounded-r-lg hover:bg-gray-300 active:bg-gray-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-lg sm:text-base"
                  >
                    +
                  </button>
                </div>
                <div className="text-center text-sm text-gray-500 mt-2">
                  Tăng/giảm theo bước 5 phút
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                <span className="font-bold text-blue-600">{(totalCost || 0).toLocaleString()} VND</span>
              </div>
              
              {userBalance !== null && userBalance < totalCost && (
                <div className="mt-2 text-red-500 text-sm">
                  Số dư không đủ. Vui lòng nạp thêm tiền vào tài khoản.
                </div>
              )}
            </div>              <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors font-medium min-h-[48px] text-base"
              >
                Nạp tiền
              </button>
              <button
                onClick={handlePayment}
                disabled={loading || userBalance === null || userBalance < totalCost}
                className={`px-8 py-3 rounded-lg text-white font-medium min-h-[48px] text-base ${
                  loading || userBalance === null || userBalance < totalCost ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                } transition-colors`}
              >
                {loading ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Bạn đang yêu cầu trò chuyện với bác sĩ. Sau khi gửi yêu cầu, bạn có thể bắt đầu trò chuyện ngay lập tức.
            </p>            <button
              onClick={handleStartChat}
              disabled={loading}
              className={`w-full px-8 py-4 rounded-full text-white font-medium text-lg min-h-[52px] ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              } transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {loading ? "Đang xử lý..." : "Bắt đầu trò chuyện"}
            </button>
          </>
        )}      </div>
      
      {/* Inline Deposit Modal */}
      <InlineDepositModal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDepositSuccess={handleDepositSuccess}
        requiredAmount={totalCost}
        currentBalance={userBalance}
      />
    </div>
  );
}
