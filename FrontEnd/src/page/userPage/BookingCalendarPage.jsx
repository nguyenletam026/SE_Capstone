import React, { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const BookingCalendarPage = () => {
  const [selectedDay, setSelectedDay] = useState();

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="w-1/2 bg-green-200 flex items-center justify-center">
        <img src="/mascot.png" alt="Mascot" className="w-60 h-60" />
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-yellow-100 flex flex-col justify-center items-center p-10">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Đặt Lịch Tư Vấn Sức Khỏe Tâm Lí
        </h2>
        <p className="text-lg font-medium text-center mb-6">Chọn Ngày</p>
        <p className="text-sm mb-2 text-gray-500">Chọn ít nhất 1 ngày</p>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            footer={
              selectedDay ? (
                <p className="text-sm text-center text-gray-700 mt-2">
                  Bạn đã chọn: <strong>{format(selectedDay, 'dd/MM/yyyy')}</strong>
                </p>
              ) : null
            }
            locale={{
              localize: {
                day: n => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][n],
                month: n => `Tháng ${n + 1}`,
              },
              formatLong: {
                date: () => 'dd/MM/yyyy'
              }
            }}
            className="text-sm"
          />
        </div>

        <button className="mt-6 bg-brown-700 text-white px-6 py-2 rounded-full flex items-center space-x-2">
          <span>Tiếp Tục</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default BookingCalendarPage;
