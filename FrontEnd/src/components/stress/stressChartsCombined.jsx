// 📁 components/stress/StressChartsCombined.jsx
import React, { useState, useEffect } from "react";
import TodayChart from "./stressChartToday";
import WeeklyChart from "./stressChartWeekly";
import { FaExclamationCircle } from "react-icons/fa";

export default function StressChartsCombined({ refreshSignal }) {
  const [key, setKey] = useState(0);
  const [hasData, setHasData] = useState({
    today: null,
    weekly: null
  });

  // Re-render charts when refreshSignal changes
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [refreshSignal]);

  // This function will be called by child charts
  const handleDataStatus = (chartType, hasData) => {
    setHasData(prev => ({
      ...prev,
      [chartType]: hasData
    }));
  };

  const renderNoDataMessage = (chartType) => {
    if (hasData[chartType] === false) {
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
          <FaExclamationCircle className="text-gray-400 text-4xl mb-3" />
          <p className="text-gray-500 text-lg font-medium">No Data</p>
          <p className="text-gray-400 text-sm mt-1">Chưa có dữ liệu cho biểu đồ này</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {renderNoDataMessage('today') || <TodayChart key={`today-${key}`} refreshSignal={refreshSignal} onDataStatus={(hasData) => handleDataStatus('today', hasData)} />}
        </div>
        <div>
          {renderNoDataMessage('weekly') || <WeeklyChart key={`weekly-${key}`} refreshSignal={refreshSignal} onDataStatus={(hasData) => handleDataStatus('weekly', hasData)} />}
        </div>
      </div>
    </div>
  );
}
