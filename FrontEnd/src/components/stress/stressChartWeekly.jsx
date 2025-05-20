import React, { useState, useEffect } from "react";
import { getWeeklyStress } from "../../lib/user/stressServices";
import { FaExclamationCircle } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WeeklyChart({ refreshSignal, onDataStatus }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refreshSignal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getWeeklyStress();
      if (response && response.code === 1000) {
        processChartData(response.result);
      } else {
        setError("Không thể tải dữ liệu biểu đồ");
        setChartData(null);
        if (onDataStatus) onDataStatus(false);
      }
    } catch (err) {
      console.error("Error fetching weekly chart data:", err);
      setError("Lỗi khi tải dữ liệu");
      setChartData(null);
      if (onDataStatus) onDataStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setChartData(null);
      if (onDataStatus) onDataStatus(false);
      return;
    }

    // For now, let's use sample data
    // In a real implementation, process the actual data here
    const chartData = {
      labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
      datasets: [
        {
          label: "Điểm stress trung bình",
          data: [65, 59, 80, 81, 56, 55, 40],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    };

    setChartData(chartData);
    if (onDataStatus) onDataStatus(true);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Mức Độ Stress Trong Tuần",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Mức độ stress",
        },
      },
      x: {
        title: {
          display: true,
          text: "Ngày trong tuần",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <FaExclamationCircle className="text-gray-400 text-4xl mb-3" />
        <p className="text-gray-500 text-lg font-medium">No Data</p>
        <p className="text-gray-400 text-sm mt-1">
          {error || "Chưa có dữ liệu trong tuần này"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow h-48">
      <Bar data={chartData} options={options} />
    </div>
  );
}
