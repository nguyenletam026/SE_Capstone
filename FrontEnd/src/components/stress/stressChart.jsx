import { useEffect, useState } from "react";
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
import { getMonthlyStress } from "../../lib/user/stressServices";

export default function StressChart() {
  const [chartData, setChartData] = useState([]);
  const [allMonths, setAllMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [rawResult, setRawResult] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const raw = await getMonthlyStress();

      // Lấy danh sách các tháng có trong dữ liệu
      const monthGroups = raw.result.reduce((acc, item) => {
        const date = new Date(item.start_date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!acc.includes(monthKey)) acc.push(monthKey);
        return acc;
      }, []);

      setAllMonths(monthGroups);

      if (!selectedMonth) {
        setSelectedMonth(monthGroups[monthGroups.length - 1]); // Mặc định chọn tháng mới nhất nếu chưa có
      }

      setRawResult(raw.result);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedMonth || rawResult.length === 0) return;

    const [year, month] = selectedMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const filtered = rawResult.filter((item) => {
      const date = new Date(item.start_date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });

    const dataMap = {};
    filtered.forEach((entry) => {
      const day = new Date(entry.start_date).getDate();
      dataMap[day] = Math.round(entry.average_stress_score);
    });

    const filledData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        date:
          day.toString().padStart(2, "0") +
          "/" +
          month.toString().padStart(2, "0"),
        score: dataMap[day] || 0,
      };
    });

    setChartData(filledData);
  }, [selectedMonth, rawResult]);

  const getMonthDisplayName = (key) => {
    const [year, month] = key.split("-");
    return `Tháng ${parseInt(month)}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Biểu Đồ Mức Độ Stress Trong {getMonthDisplayName(selectedMonth)}
        </h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          {allMonths.map((month) => (
            <option key={month} value={month}>
              {month.split("-").reverse().join("/")}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          barCategoryGap={4}
          margin={{ top: 40, right: 30, left: 50, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date">
            <Label
              value="Ngày"
              offset={20}
              position="bottom"
              style={{ fill: "#4b5563", fontSize: 12 }}
            />
          </XAxis>
          <YAxis domain={[0, 100]}>
            <Label
              value="Điểm Trung Bình Stress"
              position="top"
              offset={10}
              style={{ fill: "#4b5563", fontSize: 12 }}
            />
          </YAxis>
          <Tooltip
            formatter={(value, name) => [
              `${value}`,
              name === "score" ? "Điểm Trung Bình" : name,
            ]}
            labelFormatter={(label) => `Ngày: ${label}`}
          />
          <Bar
            dataKey="score"
            fill="#10b981"
            radius={[10, 10, 0, 0]}
            barSize={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
