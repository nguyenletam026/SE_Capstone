import React, { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const BookingCalendarPage = () => {
  const [selectedDay, setSelectedDay] = useState();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 bg-green-200 flex items-center justify-center p-6 lg:p-0 min-h-64 lg:min-h-screen">
        <img 
          src="/mascot.png" 
          alt="Mascot" 
          className="w-40 h-40 sm:w-48 sm:h-48 lg:w-60 lg:h-60 object-contain" 
        />
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 bg-yellow-100 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10">        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center mb-2 leading-tight">
          Book Mental Health Consultation
        </h2>
        <p className="text-base sm:text-lg font-medium text-center mb-4 sm:mb-6">Select Date</p>
        <p className="text-xs sm:text-sm mb-2 text-gray-500 text-center">Select at least 1 day</p>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md w-full max-w-md lg:max-w-lg">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            footer={
              selectedDay ? (                <p className="text-xs sm:text-sm text-center text-gray-700 mt-2">
                  You selected: <strong>{format(selectedDay, 'dd/MM/yyyy')}</strong>
                </p>
              ) : null
            }            locale={{
              localize: {
                day: n => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][n],
                month: n => `Month ${n + 1}`,
              },
              formatLong: {
                date: () => 'dd/MM/yyyy'
              }
            }}
            className="text-sm w-full"
          />
        </div>        <button className="mt-4 sm:mt-6 bg-brown-700 hover:bg-brown-800 active:bg-brown-900 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full flex items-center space-x-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium">
          <span>Continue</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default BookingCalendarPage;
