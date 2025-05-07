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

    // Sort data by date (most recent first) and take last 6 months
    const sortedData = data
      .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
      .slice(0, 6)
      .reverse(); // Reverse to show chronological order

    const labels = sortedData.map(item => {
      const date = new Date(item.end_date);
      return date.toLocaleDateString('vi-VN', { 
        month: 'short', 
        year: '2-digit' 
      });
    });

    const stressData = sortedData.map(item => item.average_stress_score);

    // Calculate average stress for color determination
    const avgStress = stressData.reduce((sum, score) => sum + score, 0) / stressData.length;
    let backgroundColor, borderColor;
    
    if (avgStress > 70) {
      backgroundColor = "rgba(239, 68, 68, 0.2)";
      borderColor = "rgba(239, 68, 68, 1)";
    } else if (avgStress > 40) {
      backgroundColor = "rgba(251, 191, 36, 0.2)";
      borderColor = "rgba(251, 191, 36, 1)";
    } else {
      backgroundColor = "rgba(34, 197, 94, 0.2)";
      borderColor = "rgba(34, 197, 94, 1)";
    }
    
    const chartData = {
      labels,
      datasets: [
        {
          label: "Mức độ stress trung bình",
          data: stressData,
          fill: true,
          backgroundColor,
          borderColor,
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
