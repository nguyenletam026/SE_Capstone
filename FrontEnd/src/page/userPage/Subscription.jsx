import React, { useState } from 'react';
import mascot from '../../assets/4.png';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('momo');

  const plans = [
    { label: '1 tháng', price: 'vnd 300.000' },
    { label: '2 tháng', price: 'vnd 800.000' },
    { label: '3 tháng', price: 'vnd 1.000.000' },
    { label: '4 tháng', price: 'vnd 1.200.000' },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-[#d1fae5] via-[#fef9c3] to-[#fefce8]">
      {/* Left Side */}
      <div className="flex flex-col items-center justify-center px-8 py-12 space-y-6">
        <img src={mascot} alt="Mascot" className="w-28 h-28 rounded-full shadow-lg" />
        <h2 className="text-xl font-bold text-[#166534] bg-white px-6 py-2 rounded-lg shadow-md">Chọn Gói</h2>
        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-md">
          {plans.map((plan, idx) => (
            <label
              key={idx}
              className={`flex justify-between items-center p-3 border rounded-lg my-2 cursor-pointer transition duration-200 ${
                selectedPlan === idx
                  ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === idx}
                  onChange={() => setSelectedPlan(idx)}
                  className="mr-3 accent-green-600"
                />
                <div>
                  <p className="font-medium text-gray-800">{plan.label}</p>
                  <p className="text-sm text-gray-500">1 giờ/buổi</p>
                </div>
              </div>
              <p className="font-semibold text-green-700">{plan.price}</p>
            </label>
          ))}
          <div className="mt-4 bg-green-50 p-4 rounded-md">
            <h4 className="font-semibold text-green-800 mb-2">Bạn Sẽ Được</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
              <li>Tư vấn 1:1 với chuyên gia</li>
              <li>Hỗ trợ mọi lúc, mọi nơi</li>
              <li>Bài tập tâm lý mỗi tuần</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-col justify-center items-center px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Thanh Toán Gói</h2>
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-md">
          <p className="text-center font-medium mb-4 text-gray-700">Phương Thức Thanh Toán</p>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border p-2 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-green-200"
          >
            <option value="momo">Momo</option>
            <option value="vnpay">VNPay</option>
            <option value="payos">PayOS</option>
          </select>

          <input
            type="text"
            placeholder="Tên Chủ Thẻ"
            className="w-full border p-2 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-green-200"
          />
          <input
            type="text"
            placeholder="Số Tài Khoản"
            className="w-full border p-2 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-green-200"
          />
          <div className="flex space-x-2 mb-3">
            <select className="w-1/2 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-200">
              <option>Month</option>
            </select>
            <select className="w-1/2 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-200">
              <option>Year</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Code"
            className="w-full border p-2 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-green-200"
          />
          <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition">
            <span>Thanh Toán</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
