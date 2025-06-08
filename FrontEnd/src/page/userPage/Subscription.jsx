import React, { useState } from 'react';
import mascot from '../../assets/4.png';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const plans = [
    { label: '1 month', price: 'vnd 300.000' },
    { label: '2 months', price: 'vnd 800.000' },
    { label: '3 months', price: 'vnd 1.000.000' },
    { label: '4 months', price: 'vnd 1.200.000' },
  ];
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-[#d1fae5] via-[#fef9c3] to-[#fefce8]">
      {/* Left Side */}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        <img src={mascot} alt="Mascot" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg" />
        <h2 className="text-lg sm:text-xl font-bold text-[#166534] bg-white px-4 sm:px-6 py-2 rounded-lg shadow-md">Choose Plan</h2>
        <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-md shadow-md">
          {plans.map((plan, idx) => (
            <label
              key={idx}
              className={`flex justify-between items-center p-4 sm:p-3 border rounded-lg my-2 cursor-pointer transition duration-200 min-h-[56px] ${
                selectedPlan === idx
                  ? 'border-green-600 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300 hover:border-green-400 active:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === idx}
                  onChange={() => setSelectedPlan(idx)}
                  className="mr-3 accent-green-600 w-4 h-4 sm:w-5 sm:h-5"
                />
                <div>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{plan.label}</p>
                  <p className="text-xs sm:text-sm text-gray-500">1 hour/session</p>
                </div>
              </div>
              <p className="font-semibold text-green-700 text-sm sm:text-base">{plan.price}</p>
            </label>
          ))}          <div className="mt-4 bg-green-50 p-4 rounded-md">
            <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">What You'll Get</h4>
            <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 space-y-1">
              <li>1:1 consultation with experts</li>
              <li>Support anytime, anywhere</li>
              <li>Weekly psychological exercises</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side */}      <div className="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Package Payment</h2>
        <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-md">
          <p className="text-center font-medium mb-4 text-gray-700 text-sm sm:text-base">Payment Method</p>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border p-3 sm:p-2 rounded-lg mb-4 text-sm sm:text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 min-h-[48px]"
          >
            <option value="momo">Momo</option>
            <option value="vnpay">VNPay</option>
            <option value="payos">PayOS</option>
          </select>

          <input
            type="text"
            placeholder="Tên Chủ Thẻ"
            className="w-full border p-3 sm:p-2 rounded-lg mb-3 text-sm sm:text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 min-h-[48px]"
          />
          <input
            type="text"
            placeholder="Số Tài Khoản"
            className="w-full border p-3 sm:p-2 rounded-lg mb-3 text-sm sm:text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 min-h-[48px]"
          />
          <div className="flex space-x-2 mb-3">
            <select className="w-1/2 border p-3 sm:p-2 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 min-h-[48px]">
              <option>Month</option>
            </select>
            <select className="w-1/2 border p-3 sm:p-2 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 min-h-[48px]">
              <option>Year</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Code"
            className="w-full border p-3 sm:p-2 rounded-lg mb-4 text-sm sm:text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 min-h-[48px]"
          />
          <button className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white w-full py-4 sm:py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] min-h-[52px] shadow-lg hover:shadow-xl">
            <span className="text-base sm:text-sm">Thanh Toán</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
