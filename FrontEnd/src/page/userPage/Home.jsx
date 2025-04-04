import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/localStorageService";
import StressChart from "../../components/stress/stressChart";
import StressHomeSection from "../../components/stress/StressHomeSection"; // 👈 MỚI

export default function Home() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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
      {/* Section 1 - Greeting moved to separate component */}
      <StressHomeSection />

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
