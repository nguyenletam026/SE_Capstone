// 📁 components/stress/StressChartsCombined.jsx
import React, { useState, useEffect } from "react";
import TodayChart from "./stressChartToday";
import WeeklyChart from "./stressChartWeekly";

export default function StressChartsCombined({ refreshSignal }) {
  const [key, setKey] = useState(0);

  // Re-render charts when refreshSignal changes
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [refreshSignal]);

  return (
    <div className="w-full px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodayChart key={`today-${key}`} refreshSignal={refreshSignal} />
        <WeeklyChart key={`weekly-${key}`} refreshSignal={refreshSignal} />
      </div>
    </div>
  );
}
