import React, { useState } from 'react';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(0);

  const plans = [
    { label: '1 tháng', price: 'vnd 300.0' },
    { label: '2 tháng', price: 'vnd 800.00' },
    { label: '3 tháng', price: 'vnd 100.000.0' },
    { label: '4 tháng', price: 'vnd 100.000.0' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="w-1/2 bg-green-200 flex flex-col items-center justify-center p-8">
        <div className="mb-4">
          <img src="/mascot.png" alt="Mascot" className="w-40 h-40" />
        </div>
        <h2 className="text-lg font-bold mb-2 border border-blue-500 px-6 py-2 rounded-lg">Chọn Gói</h2>
        <div className="bg-white p-4 rounded-xl w-full max-w-sm">
          {plans.map((plan, idx) => (
            <label key={idx} className={`flex justify-between items-center p-3 border rounded-lg my-2 cursor-pointer ${selectedPlan === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="plan"
                  checked={selectedPlan === idx}
                  onChange={() => setSelectedPlan(idx)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium">{plan.label}</p>
                  <p className="text-sm text-gray-500">1 giờ/buổi</p>
                </div>
              </div>
              <p className="font-semibold">{plan.price}</p>
            </label>
          ))}
          <div className="mt-4 bg-gray-100 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Bạn Sẽ Được</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Bla bla bla</li>
              <li>123</li>
              <li>123</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-yellow-100 flex flex-col justify-center items-center p-8">
        <h2 className="text-2xl font-semibold mb-6">Thanh Toán Gói</h2>
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-md">
          <p className="text-center font-medium mb-4">Credit Card Details</p>
          <div className="border p-3 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-sm">Payment Method</span>
            <div className="flex space-x-2">
              <img src="/visa.png" alt="Visa" className="h-6" />
              <img src="/mastercard.png" alt="MasterCard" className="h-6" />
              <img src="/amex.png" alt="Amex" className="h-6" />
            </div>
          </div>
          <input type="text" placeholder="Tên Chủ Thẻ" className="w-full border p-2 rounded-lg mb-3 text-sm" />
          <input type="text" placeholder="Số Tài Khoản" className="w-full border p-2 rounded-lg mb-3 text-sm" />
          <div className="flex space-x-2 mb-3">
            <select className="w-1/2 border p-2 rounded-lg text-sm">
              <option>Month</option>
            </select>
            <select className="w-1/2 border p-2 rounded-lg text-sm">
              <option>Year</option>
            </select>
          </div>
          <input type="text" placeholder="Code" className="w-full border p-2 rounded-lg mb-4 text-sm" />
          <button className="bg-brown-700 text-white w-full py-2 rounded-lg font-semibold flex items-center justify-center space-x-2">
            <span>Thanh Toán</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;