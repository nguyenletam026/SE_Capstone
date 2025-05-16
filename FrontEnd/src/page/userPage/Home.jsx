// 📁 pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StressChart from "../../components/stress/stressChart";
import StressChartsCombined from "../../components/stress/stressChartsCombined";
import StressHomeSection from "../../components/stress/StressHomeSection";
import StressMonitor from "../../components/stress/StressMonitor";
import Daily from "../../assets/5.png";
import Rain from "../../assets/6.png";
import Music from "../../assets/7.png";
import Yoga from "../../assets/8.png";
import DoctorImg from "../../assets/9.png";

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [refreshCharts, setRefreshCharts] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="text-gray-800">
      {/* Section 1 - Greeting */}
      <StressHomeSection onRefreshCharts={() => setRefreshCharts(prev => prev + 1)} />

      {/* Section 2 - Today + Weekly Chart */}
      <StressChartsCombined refreshSignal={refreshCharts} />

      {/* Section 2.5 - Stress Monitoring */}
      <div className="mt-10 px-6">
        <StressMonitor />
      </div>

      {/* Section 3 - Monthly Chart */}
      <div className="mt-10 px-6">
        <StressChart key={refreshCharts} />
      </div>

      {/* Section 4 - Tips */}
      <div className="mt-10 px-6">
        <h2 className="text-2xl font-bold mb-6">Các Biện Pháp Giảm Stress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Lịch Sinh Hoạt Cho Một Ngày Vui Vẻ", img: Daily },
            { title: "Nghe Âm Thanh Mưa Thư Giãn", img: Rain },
            { title: "Âm Nhạc Giúp Cân Bằng Cảm Xúc", img: Music },
            { title: "Tập Yoga Giảm Căng Thẳng", img: Yoga },
          ].map((item, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <img
                src={item.img}
                alt={item.title}
                className="h-32 w-full object-cover"
              />
              <div className="p-2 text-sm font-medium">{item.title}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="bg-brown-700 hover:bg-brown-800 text-white py-3 px-6 rounded-full">
            Liên Hệ Với Bác Sĩ →
          </button>
        </div>
      </div>

      {/* Section 5 - Doctor Recruitment with Image + Button Layout */}
      <div className="mt-16 px-6 py-10 bg-green-100 rounded-lg shadow text-center">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/2">
            <img
              src={DoctorImg}
              alt="Doctor Recruitment"
              className="rounded-lg w-full h-auto object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 text-left">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Bạn là chuyên gia tâm lý?</h3>
            <p className="text-gray-700 mb-5">Hãy tham gia hệ thống để hỗ trợ học sinh vượt qua căng thẳng và áp lực học tập.</p>
            <Link
              to="/apply-doctor"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full text-sm font-medium"
            >
              Gửi Yêu Cầu Trở Thành Bác Sĩ Tư Vấn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
