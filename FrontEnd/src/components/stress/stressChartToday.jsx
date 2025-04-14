import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";
import { getTodayStress } from "../../lib/user/stressServices";

export default function TodayChart(refreshSignal) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTodayStress();
        const chartData = res.result?.stress_analyses?.map((item) => ({
          time: new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          score: Math.round(item.stressScore),
        })) || [];
        setData(chartData);
      } catch (err) {
        console.error("Failed to fetch today chart:", err);
      }
    };
    fetchData(); 
  }, [refreshSignal]);

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">Biểu Đồ Stress Trong Ngày</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time">
            <Label value="Giờ" position="bottom" offset={10} />
          </XAxis>
          <YAxis domain={[0, 100]}>
            <Label value="A  Điểm Stress TB" position="insideTopLeft" offset={-20} />
          </YAxis>
          <Tooltip />
          <Bar dataKey="score" fill="#60a5fa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
