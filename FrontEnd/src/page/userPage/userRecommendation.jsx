import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRecommendation, getAllDoctorRecommend, getCurrentAvailableDoctors, getDoctorsWithAvailableSlots } from "../../lib/user/assessmentServices";
import { FiClock, FiUser, FiCalendar, FiMusic, FiVideo, FiArrowLeft, FiMessageCircle, FiX, FiFilter, FiHome, FiCheck, FiInfo, FiStar, FiPlay, FiChevronRight, FiMaximize, FiHeart } from "react-icons/fi";

export default function Recommendation() {
  const [data, setData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [videoModal, setVideoModal] = useState(null); // Track which video is shown in modal
  const navigate = useNavigate();
  
  // User information
  const currentDateTime = "2025-05-24 15:09:42";
  const currentUser = "nguyenletam026";

  useEffect(() => {
    const fetchRecommend = async () => {
      try {
        let doctorRes;
        
        try {          // Try to get user-specific recommendation
          const recommendRes = await getMyRecommendation();
          setData(recommendRes.result);
          
          if (recommendRes.result?.recommendationType === "DOCTOR_ADVISE") {
            // Use the new API to get only doctors with available slots
            doctorRes = await getDoctorsWithAvailableSlots();
          } else {
            doctorRes = await getAllDoctorRecommend();
          }
        } catch (err) {
          // If no recommendation, set default state and get all doctors
          setData({
            recommendationType: "GENERAL",
            stressLevel: "N/A",
            recommendations: []
          });
          
          doctorRes = await getAllDoctorRecommend();
        }
        
        setDoctors(doctorRes.result || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommend();
  }, []);

  const handleBackHome = () => navigate("/");
  const handleSelectDoctor = (id) => navigate(`/contact-doctor/${id}`);

  const handleToggleDoctors = async () => {
    setShowAllDoctors(!showAllDoctors);
    try {      if (!showAllDoctors) {
        const res = await getAllDoctorRecommend();
        setDoctors(res.result || []);
      } else {
        const res = await getDoctorsWithAvailableSlots();
        setDoctors(res.result || []);
      }
    } catch (err) {
      console.error("Error toggling doctor list:", err);
    }
  };

  // Open video in modal
  const openVideoModal = (video) => {
    setVideoModal(video);
    // When modal is open, prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  // Close video modal
  const closeVideoModal = () => {
    setVideoModal(null);
    document.body.style.overflow = 'auto';
  };

  // Translate stress level to English
  const translateStressLevel = (level) => {
    switch(level) {
      case "MILD": return "Mild";
      case "MODERATE": return "Moderate";
      case "SEVERE": return "Severe";
      case "NO_DATA": return "No Data";
      default: return level;
    }
  };

  // Get stress level color
  const getStressLevelColor = (level) => {
    switch(level) {
      case "MILD": return "text-green-600 bg-green-100 border-green-200";
      case "MODERATE": return "text-orange-600 bg-orange-100 border-orange-200";
      case "SEVERE": return "text-red-600 bg-red-100 border-red-200";
      default: return "text-blue-600 bg-blue-100 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-indigo-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-indigo-800 font-medium">Loading your personalized recommendations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50">
      {/* Header with user info */}
      <div className="bg-white shadow-md border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackHome}
              className="p-2 rounded-full hover:bg-indigo-50 transition-colors"
            >
              <FiArrowLeft className="text-indigo-700" size={20} />
            </button>
            <h1 className="text-xl font-bold text-indigo-900">Personalized Recommendations</h1>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center">
              <FiUser className="mr-2 text-indigo-500" />
              <span className="font-medium">{currentUser}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-2 text-indigo-500" />
              <span>{currentDateTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stress Level Banner */}
        <div className="mb-8 bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Wellness Recommendations</h2>
                <p className="mt-1 opacity-90">Based on your latest stress assessment</p>
              </div>
              
              {data?.stressLevel && data.stressLevel !== "NO_DATA" && (
                <div className={`px-4 py-2 rounded-xl font-medium text-sm ${getStressLevelColor(data.stressLevel)} border`}>
                  <span className="font-bold">Stress Level:</span> {translateStressLevel(data.stressLevel)}
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-indigo-50 border-t border-indigo-100">
            <div className="flex items-start">
              <FiInfo className="text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-indigo-900">
                {data?.recommendationType === "DOCTOR_ADVISE" ? 
                  "Based on your assessment, we recommend speaking with a doctor. Here are available professionals who can help you." :
                  data?.recommendationType === "MUSIC_LISTENING" ?
                  "Music therapy can help reduce your stress levels. We've selected some calming tracks for you." :
                  data?.recommendationType === "YOGA_EXCERSITE" ?
                  "Yoga exercises can help manage stress. Try these guided video sessions." :
                  "Here are doctors available to consult about your wellbeing."}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          {/* Doctors Section */}
          {data?.recommendationType === "DOCTOR_ADVISE" || data?.recommendationType === "GENERAL" || data?.stressLevel === "NO_DATA" ? (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 text-white flex justify-between items-center">
                <div className="flex items-center">
                  <FiUser className="mr-3 text-white text-xl" />
                  <h3 className="text-lg font-semibold">
                    {!showAllDoctors ? "Available Doctors" : "All Doctors"}
                  </h3>
                </div>
                
                <button
                  onClick={handleToggleDoctors}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <FiFilter className="mr-1.5" />
                  {showAllDoctors ? "Show Available Only" : "Show All Doctors"}
                </button>
              </div>
              
              <div className="p-6">
                {doctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer hover:border-indigo-200 hover:translate-y-[-2px]"
                        onClick={() => handleSelectDoctor(doctor.id)}
                      >
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24 relative">
                          {!showAllDoctors && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></div>
                              Available Now
                            </div>
                          )}
                          <div className="absolute -bottom-10 left-6">
                            <img
                              src={doctor.avtUrl || "https://via.placeholder.com/80"}
                              alt={doctor.firstName}
                              className="w-20 h-20 rounded-full object-cover border-4 border-white group-hover:border-indigo-100 transition-all"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-12 px-6 pb-6">
                          <h4 className="font-bold text-lg text-gray-900">{doctor.lastName} {doctor.firstName}</h4>
                          <p className="text-indigo-600 text-sm mb-3">{doctor.username}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <FiCalendar className="mr-1.5" />
                              <span>{currentDateTime.split(' ')[0]}</span>
                            </div>
                            <div className="text-indigo-500 flex items-center">
                              <FiHeart className="mr-1.5" />
                              <span>98% Positive</span>
                            </div>
                          </div>
                          
                          <button className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center group-hover:bg-indigo-500">
                            <FiMessageCircle className="mr-2" />
                            Start Consultation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
                      <FiInfo className="text-gray-500 text-xl" />
                    </div>
                    <p className="text-gray-600 font-medium">No doctors are currently available.</p>
                    <p className="text-gray-500 text-sm mt-1">Please check back later or contact support.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Music Section */}
          {data?.recommendationType === "MUSIC_LISTENING" && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
                <div className="flex items-center">
                  <FiMusic className="mr-3 text-white text-xl" />
                  <h3 className="text-lg font-semibold">Music Therapy</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:border-purple-200 hover:translate-y-[-2px]">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                        <h4 className="font-medium">{rec.recommendName}</h4>
                      </div>
                      <div className="p-4 bg-gradient-to-b from-purple-50 to-white">
                        <audio controls className="w-full">
                          <source src={rec.recommendUrl} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  ))}
                </div>
                
                
              </div>
            </div>
          )}

          {/* Yoga Section - Modified to show videos in popup */}
          {data?.recommendationType === "YOGA_EXCERSITE" && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-green-500 px-6 py-4 text-white">
                <div className="flex items-center">
                  <FiVideo className="mr-3 text-white text-xl" />
                  <h3 className="text-lg font-semibold">Yoga Exercises</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recommendations.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:border-teal-200 hover:translate-y-[-2px] cursor-pointer group"
                      onClick={() => openVideoModal(rec)}
                    >
                      <div className="relative h-48 bg-teal-50 overflow-hidden">
                        {/* Placeholder thumbnail - in a real app, you'd use an actual thumbnail */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-green-400/20 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-teal-500/90 group-hover:bg-teal-600/90 flex items-center justify-center transition-all duration-300 shadow-lg group-hover:scale-110">
                            <FiPlay className="text-white text-2xl ml-1" />
                          </div>
                          <div className="absolute inset-0 border-4 border-white/0 group-hover:border-white/20 rounded-xl transition-all duration-300"></div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800 group-hover:text-teal-700 transition-colors">{rec.recommendName}</h4>
                          <div className="flex items-center text-teal-600 text-sm font-medium">
                            <FiPlay className="mr-1.5" />
                            Play Video
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">Click to watch this guided yoga session</p>
                      </div>
                    </div>
                  ))}
                </div>
                
               
              </div>
            </div>
          )}
        </div>
        
        {/* Footer actions */}
      </div>
      
      {/* Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-zoom-in">
            <div className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-medium flex items-center">
                <FiVideo className="mr-2" />
                {videoModal.recommendName}
              </h3>
              <button 
                onClick={closeVideoModal}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <FiX className="text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <video 
                controls 
                autoPlay
                className="w-full rounded-lg shadow-md"
                style={{ maxHeight: 'calc(90vh - 180px)' }}
              >
                <source src={videoModal.recommendUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
              <button
                onClick={closeVideoModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Add this to your CSS or tailwind.config.js if using Tailwind:
@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  .animate-zoom-in {
    animation: zoomIn 0.3s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
}
*/