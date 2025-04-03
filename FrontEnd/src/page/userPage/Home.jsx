import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/localStorageService";
import StressChart from "../../components/stress/stressChart";
import Bot from "../../assets/4.png";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const stressScore = 80;

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/users/myInfo`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserDetails(data.result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        navigate("/login", { replace: true });
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="text-gray-800">
      {/* Section 1 - Greeting with green wave background */}
      <div className="relative bg-[#9BB168] text-white text-center pb-16 rounded-b-[80px] overflow-hidden">
        <div className="pt-6">
          <div className="text-sm font-semibold uppercase mb-1">
            Xin Chào {userDetails.firstName?.toUpperCase()}{" "}
            {userDetails.lastName?.toUpperCase()}
          </div>
          <div className="text-xs underline mb-4 cursor-pointer">
            Thiết Lập Profile
          </div>
          <div className="text-6xl font-bold">{stressScore}</div>
          <div className="text-6xl mt-2">😊</div>
          <div className="mt-2 font-bold text-lg">
            Bạn Đang Có Tâm Trạng Tốt
          </div>
        </div>

        <div className="mt-6 flex justify-center z-10 relative">
          <img src={Bot} alt="Bot" className="w-40 h-40" />
        </div>

        {/* Sóng cong giả phía dưới */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-0">
          <svg
            viewBox="0 0 1440 320"
            className="w-full h-[100px]"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,192L80,181.3C160,171,320,149,480,160C640,171,800,213,960,229.3C1120,245,1280,235,1360,229.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      {/* Section 2 - Chart */}
      <div className="mt-10 px-6">
        <StressChart />
      </div>

      {/* Section 3 - Tips */}
      <div className="mt-10 px-6">
        <h2 className="text-2xl font-bold mb-6">Các Biện Pháp Giảm Stress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Lịch Sinh Hoạt Cho Một Ngày Vui Vẻ", img: "/tip1.jpg" },
            { title: "Tiếng Mưa Nghe Khi Làm Việc", img: "/tip2.jpg" },
            { title: "Bla Bla Bla", img: "/tip3.jpg" },
            { title: "Bla Bla Bla", img: "/tip4.jpg" },
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
    </div>
  );
}
