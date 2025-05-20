import React, { useState, useEffect } from "react";
import { getMonthlyStress } from "../../lib/user/stressServices";
import { Line } from "react-chartjs-2";
import { FaExclamationCircle } from "react-icons/fa";
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

export default function StressChart({ refreshSignal }) {
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

      const response = await getMonthlyStress();
      if (response && response.code === 1000) {
        processChartData(response.result);
      } else {
        setError("Không thể tải dữ liệu biểu đồ");
        setChartData(null);
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Lỗi khi tải dữ liệu");
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setChartData(null);
      return;
    }

    // Process data here...
    // This is placeholder logic - replace with actual data processing
    
    // Example data format
    const chartData = {
      labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      datasets: [
        {
          label: "Mức độ stress",
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: true,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.4,
        },
      ],
    };

    setChartData(chartData);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-lg border border-gray-200">
        <FaExclamationCircle className="text-gray-400 text-4xl mb-3" />
        <p className="text-gray-500 text-lg font-medium">No Data</p>
        <p className="text-gray-400 text-sm mt-1">
          {error || "Chưa có dữ liệu cho biểu đồ này"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-60">
      <Line data={chartData} options={options} />
    </div>
  );
}
