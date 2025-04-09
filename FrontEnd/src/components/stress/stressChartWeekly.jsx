import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";
import { getWeeklyStress } from "../../lib/user/stressServices";

export default function WeeklyChart(refreshSignal) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getWeeklyStress();
        const chartData = res.result?.map((item) => {
          const dateLabel = new Date(item.end_date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
          return {
            date: dateLabel,
            score: Math.round(item.average_stress_score),
          };
        }) || [];
        setData(chartData);
      } catch (err) {
        console.error("Failed to fetch weekly chart:", err);
      }
    };
    fetchData();
  }, [refreshSignal]);

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">Biểu Đồ Stress Theo Tuần</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date">
            <Label value="Ngày Kết Thúc" position="bottom" offset={10} />
          </XAxis>
          <YAxis domain={[0, 100]}>
            <Label value=" A  Điểm Stress TB " position="insideTopLeft" offset={-20} dy={-0.5}/>
          </YAxis>
          <Tooltip />
          <Line dataKey="score" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
