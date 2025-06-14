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
        setError("Unable to load chart data");
        setChartData(null);
        if (onDataStatus) onDataStatus(false);
      }
    } catch (err) {
      console.error("Error fetching today chart data:", err);
      setError("Error loading data");
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

    // Find today's data
    const today = new Date();
    const todayData = data.find(item => {
      const itemDate = new Date(item.end_date);
      return itemDate.toDateString() === today.toDateString();
    });

    if (!todayData || !todayData.stress_analyses || todayData.stress_analyses.length === 0) {
      setChartData(null);
      if (onDataStatus) onDataStatus(false);
      return;
    }

    // Process stress analyses for today
    const stressAnalyses = todayData.stress_analyses.sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    const labels = stressAnalyses.map(analysis => 
      new Date(analysis.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const stressData = stressAnalyses.map(analysis => analysis.stressScore);

    // Determine color based on average stress level
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
          label: "Today's Stress",
          data: stressData,
          fill: true,
          backgroundColor,
          borderColor,
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
        text: "Today's Stress Levels",
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
          text: "Stress Level",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
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
          {error || "No data available for today"}
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
