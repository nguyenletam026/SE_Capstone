import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

export default function Chart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    datasets: [
      {
        label: "Users",
        data: [70, 80, 65, 90, 75, 85, 60, 78, 88],
        borderColor: "purple",
        fill: true,
      },
    ],
  };

  return <Line data={data} />;
}
