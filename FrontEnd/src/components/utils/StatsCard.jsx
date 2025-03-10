export default function StatsCard({ title, value, color }) {
    const colorClasses = {
      purple: "bg-purple-100 text-purple-700",
      orange: "bg-orange-100 text-orange-700",
      green: "bg-green-100 text-green-700",
      blue: "bg-blue-100 text-blue-700"
    };
  
    return (
      <div className={`p-4 rounded-lg shadow ${colorClasses[color]}`}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  }
  