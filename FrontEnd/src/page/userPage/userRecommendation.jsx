import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRecommendation, getAllDoctorRecommend } from "../../lib/user/assessmentServices";

export default function Recommendation() {
  const [data, setData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommend = async () => {
      try {
        const recommendRes = await getMyRecommendation();
        setData(recommendRes.result);

        if (recommendRes.result.recommendationType === "DOCTOR_ADVISE") {
          const doctorRes = await getAllDoctorRecommend();
          setDoctors(doctorRes.result);
        }
      } catch (err) {
        console.error("Error fetching recommendation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommend();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brown-700"></div>
      </div>
    );
  }

  const handleBackHome = () => navigate("/");
  const handleSelectDoctor = (id) => navigate(`/contact-doctor/${id}`);

  if (!data) return <p className="text-center p-8">Không có dữ liệu gợi ý.</p>;

  return (
    <div className="min-h-screen bg-yellow-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-brown-700">
          Gợi ý phù hợp cho bạn hôm nay ({data.stressLevel})
        </h2>

        {/* Doctor Recommendation */}
        {data.recommendationType === "DOCTOR_ADVISE" && (
          <div>
            <p className="text-center text-lg font-medium mb-4">Hãy chọn một bác sĩ để bắt đầu trò chuyện:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {data.recommendations.map((rec) => {
                const full = doctors.find((d) => d.id === rec.recommendName);
                if (!full) return null;
                return (
                  <div
                    key={full.id}
                    className="border rounded-lg p-4 flex items-center gap-4 shadow bg-white cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelectDoctor(full.id)}
                  >
                    <img
                      src={full.avtUrl || "https://via.placeholder.com/80"}
                      alt={full.firstName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-lg">{full.lastName} {full.firstName}</p>
                      <p className="text-sm text-gray-500">{full.username}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Music */}
        {data.recommendationType === "MUSIC_LISTENING" && (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Thư giãn với âm nhạc</h3>
            {data.recommendations.map((rec, idx) => (
              <div key={idx} className="mb-4">
                <p className="font-medium mb-2">{rec.recommendName}</p>
                <audio controls className="w-full">
                  <source src={rec.recommendUrl} type="audio/mp3" />
                  Trình duyệt của bạn không hỗ trợ audio.
                </audio>
              </div>
            ))}
          </div>
        )}

        {/* Yoga Video */}
        {data.recommendationType === "YOGA_EXCERSITE" && (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Tập Yoga giảm căng thẳng</h3>
            {data.recommendations.map((rec, idx) => (
              <div key={idx} className="mb-4">
                <p className="font-medium mb-2">{rec.recommendName}</p>
                <video controls className="w-full rounded shadow">
                  <source src={rec.recommendUrl} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={handleBackHome}
            className="bg-brown-700 hover:bg-brown-800 text-white px-6 py-2 rounded-full"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
