import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRecommendation, getAllDoctorRecommend } from "../../lib/user/assessmentServices";

export default function Recommendation() {
  const [data, setData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommend = async () => {
      try {
        // Always fetch all doctors regardless of recommendation type
        const doctorRes = await getAllDoctorRecommend();
        setDoctors(doctorRes.result);
        
        // Still try to get user-specific recommendation if available
      try {
        const recommendRes = await getMyRecommendation();
        setData(recommendRes.result);
        } catch (err) {
          console.log("No specific recommendation available, showing all doctors");
          // If no recommendation (user hasn't done assessment), set a default state
          setData({
            recommendationType: "GENERAL",
            stressLevel: "N/A",
            recommendations: []
          });
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
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

  if (!data && doctors.length === 0) return <p className="text-center p-8">Không có dữ liệu.</p>;

  return (
    <div className="min-h-screen bg-yellow-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-brown-700">
          {data?.recommendationType === "GENERAL" || data?.stressLevel === "NO_DATA"
            ? "Danh sách bác sĩ có thể tư vấn" 
            : `Gợi ý phù hợp cho bạn hôm nay (${data?.stressLevel})`}
        </h2>

        {/* Doctor Recommendation */}
        {(data?.recommendationType === "DOCTOR_ADVISE" || showAllDoctors) && (
          <div>
            <p className="text-center text-lg font-medium mb-4">Hãy chọn một bác sĩ để bắt đầu trò chuyện:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {data?.recommendationType === "DOCTOR_ADVISE" && !showAllDoctors ? (
                // Show recommended doctors
                data.recommendations.map((rec) => {
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
                })
              ) : (
                // Show all doctors
                doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border rounded-lg p-4 flex items-center gap-4 shadow bg-white cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelectDoctor(doctor.id)}
                  >
                    <img
                      src={doctor.avtUrl || "https://via.placeholder.com/80"}
                      alt={doctor.firstName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-lg">{doctor.lastName} {doctor.firstName}</p>
                      <p className="text-sm text-gray-500">{doctor.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {data?.recommendationType === "DOCTOR_ADVISE" && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setShowAllDoctors(!showAllDoctors)}
                  className="text-blue-600 hover:underline"
                >
                  {showAllDoctors ? "Chỉ hiển thị bác sĩ được gợi ý" : "Hiển thị tất cả bác sĩ"}
                </button>
              </div>
            )}
            
            {data?.recommendationType !== "DOCTOR_ADVISE" && doctors.length === 0 && (
              <p className="text-center text-gray-500 my-4">Không có bác sĩ nào hiện có.</p>
            )}
          </div>
        )}

        {/* Music - Only show if there's a specific recommendation and not showing all doctors */}
        {data?.recommendationType === "MUSIC_LISTENING" && !showAllDoctors && (
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
            
            <div className="mt-4">
              <button 
                onClick={() => setShowAllDoctors(true)}
                className="text-blue-600 hover:underline"
              >
                Xem danh sách bác sĩ để tư vấn
              </button>
            </div>
          </div>
        )}

        {/* Yoga Video - Only show if there's a specific recommendation and not showing all doctors */}
        {data?.recommendationType === "YOGA_EXCERSITE" && !showAllDoctors && (
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
            
            <div className="mt-4">
              <button 
                onClick={() => setShowAllDoctors(true)}
                className="text-blue-600 hover:underline"
              >
                Xem danh sách bác sĩ để tư vấn
              </button>
            </div>
          </div>
        )}
        
        {/* General case - Show all doctors by default */}
        {(data?.recommendationType === "GENERAL" || data?.stressLevel === "NO_DATA") && !showAllDoctors && (
          <div>
            <p className="text-center text-lg font-medium mb-4">Hãy chọn một bác sĩ để bắt đầu trò chuyện:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border rounded-lg p-4 flex items-center gap-4 shadow bg-white cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectDoctor(doctor.id)}
                >
                  <img
                    src={doctor.avtUrl || "https://via.placeholder.com/80"}
                    alt={doctor.firstName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-lg">{doctor.lastName} {doctor.firstName}</p>
                    <p className="text-sm text-gray-500">{doctor.username}</p>
                  </div>
                </div>
              ))}
            </div>
            {doctors.length === 0 && (
              <p className="text-center text-gray-500 my-4">Không có bác sĩ nào hiện có.</p>
            )}
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
