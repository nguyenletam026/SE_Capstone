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
import { 
  FaCalendarCheck, 
  FaHeadphonesAlt, 
  FaMusic, 
  FaYinYang, 
  FaUserMd, 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaHeart, 
  FaArrowRight,
  FaLightbulb,
  FaQuestion
} from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [refreshCharts, setRefreshCharts] = useState(0);
  const [stats, setStats] = useState({
    daysStreak: null,
    averageScore: null,
    stressLevel: null,
    daysChange: null,
    scoreChange: null,
    stressChange: null
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  // Simulate fetching stats
  useEffect(() => {
    // In a real app, this would be an API call
    // For now we'll use dummy data
    setStats({
      daysStreak: 7,
      averageScore: 82,
      stressLevel: "Thấp",
      daysChange: 2,
      scoreChange: 3,
      stressChange: -5
    });
  }, []);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="text-gray-800 pb-16">
      {/* Hero Section - Greeting & Status */}
      <StressHomeSection onRefreshCharts={() => setRefreshCharts(prev => prev + 1)} />

      {/* Dashboard Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
      <div className="bg-white rounded-xl shadow-xl p-6 mb-8" style={{ paddingTop: "60px" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaChartLine className="mr-2 text-green-600" />
              Dashboard của bạn
            </h2>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Cập nhật gần nhất: {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 transition transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Số ngày liên tục</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.daysStreak !== null ? stats.daysStreak : "No Data"}
                  </h3>
                  <p className="text-blue-100 text-xs mt-2">
                    {stats.daysChange !== null ? (
                      stats.daysChange > 0 
                        ? `Tăng ${stats.daysChange} ngày so với tuần trước` 
                        : stats.daysChange < 0 
                          ? `Giảm ${Math.abs(stats.daysChange)} ngày so với tuần trước` 
                          : "Không thay đổi so với tuần trước"
                    ) : "No Data"}
                  </p>
                </div>
                <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                  {stats.daysStreak !== null ? (
                    <FaCalendarCheck className="text-2xl" />
                  ) : (
                    <FaQuestion className="text-2xl" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl shadow-lg p-6 transition transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Điểm trung bình</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.averageScore !== null ? stats.averageScore : "No Data"}
                  </h3>
                  <p className="text-purple-100 text-xs mt-2">
                    {stats.scoreChange !== null ? (
                      stats.scoreChange > 0 
                        ? `Tăng ${stats.scoreChange} điểm so với tuần trước` 
                        : stats.scoreChange < 0 
                          ? `Giảm ${Math.abs(stats.scoreChange)} điểm so với tuần trước` 
                          : "Không thay đổi so với tuần trước"
                    ) : "No Data"}
                  </p>
                </div>
                <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                  {stats.averageScore !== null ? (
                    <FaChartBar className="text-2xl" />
                  ) : (
                    <FaQuestion className="text-2xl" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-lg p-6 transition transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium">Mức độ stress</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.stressLevel || "No Data"}
                  </h3>
                  <p className="text-green-100 text-xs mt-2">
                    {stats.stressChange !== null ? (
                      stats.stressChange > 0 
                        ? `Tăng ${stats.stressChange}% so với tuần trước` 
                        : stats.stressChange < 0 
                          ? `Giảm ${Math.abs(stats.stressChange)}% so với tuần trước` 
                          : "Không thay đổi so với tuần trước"
                    ) : "No Data"}
                  </p>
                </div>
                <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                  {stats.stressLevel !== null ? (
                    <FaHeart className="text-2xl" />
                  ) : (
                    <FaQuestion className="text-2xl" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Today + Weekly Chart */}
          <StressChartsCombined refreshSignal={refreshCharts} />
        </div>
      </div>

      {/* Stress Monitoring */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-xl shadow-xl p-6 overflow-hidden">
          <div className="flex items-center mb-4 text-gray-800">
            <FaLightbulb className="text-2xl text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold">Theo dõi mức độ stress</h2>
          </div>
          <StressMonitor />
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-xl p-6 overflow-hidden">
          <div className="flex items-center mb-4 text-gray-800">
            <FaChartPie className="text-2xl text-indigo-500 mr-3" />
            <h2 className="text-2xl font-bold">Thống kê hàng tháng</h2>
          </div>
          <StressChart key={refreshCharts} />
        </div>
      </div>

      {/* Stress Relief Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800 flex items-center justify-center">
            <FaYinYang className="mr-3 text-green-600" />
            Các Biện Pháp Giảm Stress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: "Lịch Sinh Hoạt Cho Một Ngày Vui Vẻ", img: Daily, icon: <FaCalendarCheck className="text-blue-500" /> },
              { title: "Nghe Âm Thanh Mưa Thư Giãn", img: Rain, icon: <FaHeadphonesAlt className="text-indigo-500" /> },
              { title: "Âm Nhạc Giúp Cân Bằng Cảm Xúc", img: Music, icon: <FaMusic className="text-purple-500" /> },
              { title: "Tập Yoga Giảm Căng Thẳng", img: Yoga, icon: <FaYinYang className="text-green-500" /> },
            ].map((item, index) => (
              <div
                key={index}
                className="group rounded-xl shadow-xl bg-white overflow-hidden hover:scale-105 transition transform duration-300 ease-in-out"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="px-4 py-2 bg-white rounded-lg text-gray-800 font-medium transform -translate-y-4 group-hover:translate-y-0 transition duration-300">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-full bg-gray-100 mr-3">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                  </div>
                  <div className="flex justify-end">
                    <button className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium">
                      Tìm hiểu thêm <FaArrowRight className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg py-3 px-8 rounded-full shadow-lg transition duration-300 flex items-center mx-auto"
              onClick={() => navigate("/chatroom")}
            >
              <FaUserMd className="mr-2" />
              Liên Hệ Với Bác Sĩ Tư Vấn <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Doctor Recruitment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Bạn là chuyên gia tâm lý?</h3>
              <p className="text-gray-700 mb-6 text-lg">Hãy tham gia hệ thống để hỗ trợ học sinh vượt qua căng thẳng và áp lực học tập.</p>
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-700">Được kết nối với học sinh có nhu cầu</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-700">Nhận thu nhập từ việc tư vấn trực tuyến</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-700">Phát triển kinh nghiệm chuyên môn</span>
                </div>
              </div>
              <Link
                to="/apply-doctor"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition duration-300 transform hover:scale-105 shadow-lg"
              >
                <FaUserMd className="mr-2" />
                Gửi Yêu Cầu Trở Thành Bác Sĩ Tư Vấn
              </Link>
            </div>
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/40 z-10"></div>
              <img
                src={DoctorImg}
                alt="Doctor Recruitment"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
