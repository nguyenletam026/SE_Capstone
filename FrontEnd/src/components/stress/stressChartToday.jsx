import React, { useState, useEffect } from "react";
import { getDailyStress } from "../../lib/user/stressServices";
import { FaExclamationCircle } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TodayChart({ refreshSignal, onDataStatus }) {
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

      const response = await getDailyStress();
      
      if (response && response.code === 1000) {
        processChartData(response.result);
      } else {
        setError("Không thể tải dữ liệu biểu đồ");
        setChartData(null);
        if (onDataStatus) onDataStatus(false);
      }
    } catch (err) {
      console.error("Error fetching today chart data:", err);
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
      labels: ["8:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
      datasets: [
        {
          label: "Stress hôm nay",
          data: [45, 60, 75, 65, 50, 40],
          fill: true,
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderColor: "rgba(34, 197, 94, 1)",
          tension: 0.4,
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
        text: "Mức Độ Stress Hôm Nay",
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
          text: "Thời gian",
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
          {error || "Chưa có dữ liệu cho hôm nay"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow h-48">
      <Line data={chartData} options={options} />
    </div>
  );
}
