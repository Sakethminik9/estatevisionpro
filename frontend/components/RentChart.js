import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function RentChart({ points }) {
  const data = {
    labels: points.map(p => p.date),
    datasets: [{
      label: "Predicted Rent Index",
      data: points.map(p => p.rent_index),
      tension: 0.35,
      fill: false,
    }]
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#ddd" } },
      y: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#ddd" } },
    }
  };
  return (
    <div className="card p-5">
      <div className="mb-3 text-sm text-brand-200">Rent Growth Forecast (12 months)</div>
      <Line data={data} options={options} />
    </div>
  );
}
