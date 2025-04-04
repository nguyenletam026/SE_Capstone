// components/StressChart.jsx

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getMonthlyStress } from "../../lib/user/stressServices";

export default function StressChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const rawData = await getMonthlyStress();
      const formatted = rawData.map((item, index) => ({
        id: index + 1,
        stressScore: item.stressScore,
        date: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: item.stressLevel,
      }));
      setChartData(formatted);
    };

    loadData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Biểu Đồ Stress Của Bạn</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value, name) => [`${value}`, name === 'stressScore' ? 'Điểm Stress' : name]} />
          <Bar dataKey="stressScore" fill="#6366f1" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
