import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRecommendation, getAllDoctorRecommend, getCurrentAvailableDoctors, getDoctorsWithAvailableSlots } from "../../lib/user/assessmentServices";
import { getAllMusicRecommend, getAllVideoRecommend } from "../../lib/util/videoMusicRecommend";
import { 
  FiClock, FiUser, FiCalendar, FiMusic, FiVideo, FiArrowLeft, 
  FiMessageCircle, FiX, FiFilter, FiHome, FiCheck, FiInfo, 
  FiStar, FiPlay, FiChevronRight, FiMaximize, FiHeart, 
  FiMessageSquare, FiHeadphones, FiActivity, FiZap, FiTrendingUp,
  FiAlertCircle
} from "react-icons/fi";

export default function Recommendation() {
  const [data, setData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [videoModal, setVideoModal] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const navigate = useNavigate();
  
  const currentDateTime = "2025-06-04 15:58:36";
  const currentUser = "nguyenletam026";
  useEffect(() => {
    const fetchRecommend = async () => {
      try {
        let doctorRes;
        
        try {
          const recommendRes = await getMyRecommendation();
          let updatedData = recommendRes.result;
            // Handle specific recommendation types that need additional API calls
          if (recommendRes.result?.recommendationType === "MUSIC_LISTENING") {
            try {
              const musicRes = await getAllMusicRecommend();
              console.log("Music API response:", musicRes);
              console.log("Music recommendations:", musicRes.result);
              
              // The API already returns data in the correct format with recommendName and recommendUrl
              updatedData = {
                ...recommendRes.result,
                recommendations: musicRes.result || []
              };
            } catch (musicErr) {
              console.error("Error fetching music recommendations:", musicErr);
            }} else if (recommendRes.result?.recommendationType === "YOGA_EXCERSITE") {
            try {
              const videoRes = await getAllVideoRecommend();
              console.log("Video API response:", videoRes);
              console.log("Video recommendations:", videoRes.result);
              
              // Check if we have the actual video data in the recommendRes instead
              let videoData = [];
              if (recommendRes.result?.recommendations && recommendRes.result.recommendations.length > 0) {
                // Use recommendations from the original response
                videoData = recommendRes.result.recommendations;
                console.log("Using video data from recommendation response:", videoData);
              } else if (videoRes.result && Array.isArray(videoRes.result)) {
                // Transform video data from separate API call
                videoData = videoRes.result.map(video => ({
                  recommendName: video.videoName,
                  recommendUrl: video.videoUrl,
                  // Keep original fields as backup
                  videoName: video.videoName,
                  videoUrl: video.videoUrl
                }));
                console.log("Using video data from video API:", videoData);
              }
              
              updatedData = {
                ...recommendRes.result,
                recommendations: videoData
              };
              console.log("Final updated data with videos:", updatedData);
            } catch (videoErr) {
              console.error("Error fetching video recommendations:", videoErr);
            }
          }
          
          setData(updatedData);
          
          if (recommendRes.result?.recommendationType === "DOCTOR_ADVISE") {
            doctorRes = await getDoctorsWithAvailableSlots();
          } else {
            doctorRes = await getAllDoctorRecommend();
          }
        } catch (err) {
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
    try {
      if (!showAllDoctors) {
        const res = await getAllDoctorRecommend();
        setDoctors(res.result || []);
      } else {
        const res = await getDoctorsWithAvailableSlots();
        setDoctors(res.result || []);
      }
    } catch (err) {
      console.error("Error toggling doctor list:", err);
    }
  };  const openVideoModal = (video) => {
    console.log("Opening video modal with data:", video);
    console.log("Video URL (recommendUrl):", video.recommendUrl);
    console.log("Video URL (videoUrl):", video.videoUrl);
    console.log("Video Name (recommendName):", video.recommendName);
    console.log("Video Name (videoName):", video.videoName);
    setVideoModal(video);
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setVideoModal(null);
    document.body.style.overflow = 'auto';
  };

  const handleAudioPlay = (audioElement) => {
    if (currentAudio && currentAudio !== audioElement) {
      currentAudio.pause();
    }
    setCurrentAudio(audioElement);
  };

  const translateStressLevel = (level) => {
    switch(level) {
      case "MILD": return "Mild";
      case "MODERATE": return "Moderate";
      case "SEVERE": return "Severe";
      case "NO_DATA": return "No Data";
      default: return level;
    }
  };

  const getStressLevelColor = (level) => {
    switch(level) {
      case "MILD": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "MODERATE": return "text-amber-700 bg-amber-50 border-amber-200";
      case "SEVERE": return "text-rose-700 bg-rose-50 border-rose-200";
      default: return "text-sky-700 bg-sky-50 border-sky-200";
    }
  };

  const getRecommendationIcon = (type) => {
    switch(type) {
      case "DOCTOR_ADVISE": return <FiUser className="w-6 h-6" />;
      case "MUSIC_LISTENING": return <FiHeadphones className="w-6 h-6" />;
      case "YOGA_EXCERSITE": return <FiActivity className="w-6 h-6" />;
      default: return <FiZap className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-white/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-32 h-32 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-28 h-28 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute top-4 left-4 w-24 h-24 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{animationDelay: '0.2s'}}></div>
          </div>
          <div className="mt-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Crafting Your Wellness Journey</h2>
            <p className="text-white/80 text-lg">Analyzing your personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Floating Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackHome}
                className="group p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Wellness Recommendations
                </h1>
                <p className="text-gray-500 text-sm">Your personalized path to better health</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
                <FiUser className="text-indigo-500" size={18} />
                <span className="font-semibold text-indigo-700">{currentUser}</span>
              </div>
             
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    {getRecommendationIcon(data?.recommendationType)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Your Wellness Journey</h2>
                    <p className="text-white/90 text-lg">Based on your latest assessment</p>
                  </div>
                </div>
                
                {data?.stressLevel && data.stressLevel !== "NO_DATA" && (
                  <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-white/80 text-sm font-medium mb-1">Stress Level</div>
                    <div className="text-white text-xl font-bold">{translateStressLevel(data.stressLevel)}</div>
                  </div>
                )}
              </div>
                <div className="flex items-start space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <FiInfo className="text-white/80 mt-1 flex-shrink-0" size={20} />
                <p className="text-white/90 leading-relaxed">
                  {data?.recommendationType === "DOCTOR_ADVISE" ? 
                    "We recommend consulting with a healthcare professional. Below are available doctors who can provide personalized guidance for your wellness journey." :
                    data?.recommendationType === "MUSIC_LISTENING" ?
                    "Music therapy has been shown to reduce stress and promote relaxation. We've curated a selection of therapeutic soundscapes tailored to your needs." :
                    data?.recommendationType === "YOGA_EXCERSITE" ?
                    "Mindful movement through yoga can help balance your mind and body. These guided sessions are designed to reduce stress and improve overall well-being." :
                    "Explore our comprehensive wellness recommendations designed specifically for your current needs and goals."}
                </p>
              </div>
            </div>
          </div>
        </div>        {/* Recommendations Section */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <div className="mt-12">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
                  {data?.recommendationType === "MUSIC_LISTENING" ? 
                    <FiHeadphones className="w-6 h-6 text-indigo-600" /> :
                    data?.recommendationType === "YOGA_EXCERSITE" ?
                    <FiActivity className="w-6 h-6 text-green-600" /> :
                    <FiUser className="w-6 h-6 text-purple-600" />
                  }
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {data?.recommendationType === "MUSIC_LISTENING" ? "Therapeutic Music" : 
                     data?.recommendationType === "YOGA_EXCERSITE" ? "Yoga & Exercise Videos" : 
                     data?.recommendationType === "DOCTOR_ADVISE" ? "Available Doctors" :
                     "Personalized Recommendations"}
                  </h3>
                  <p className="text-gray-600">Specially selected for your wellness journey</p>
                </div>
              </div>              {/* Music Recommendations Grid */}
              {data?.recommendationType === "MUSIC_LISTENING" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.recommendations.map((music, index) => {
                    const audioUrl = music.recommendUrl;
                    const audioName = music.recommendName;
                    
                    console.log(`Music ${index + 1}:`, { audioName, audioUrl, music });
                    
                    return (
                      <div key={index} className="group bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 bg-green-500 rounded-xl">
                            <FiMusic className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-800 truncate">
                              {audioName || `Music ${index + 1}`}
                            </h4>
                            <p className="text-green-600 text-sm">Therapeutic Audio</p>
                          </div>
                        </div>
                        
                        {audioUrl ? (
                          <div className="mb-4">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <audio 
                                controls 
                                preload="metadata"
                                className="w-full"
                                style={{ height: '40px' }}
                                onPlay={(e) => handleAudioPlay(e.target)}
                                onError={(e) => console.error(`Audio error for ${audioName}:`, e)}
                              >
                                <source src={audioUrl} type="audio/mpeg" />
                                <source src={audioUrl} type="audio/mp3" />
                                <source src={audioUrl} type="audio/wav" />
                                <source src={audioUrl} type="audio/mp4" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                            
                            {/* Debug info */}
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="truncate">URL: {audioUrl}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-yellow-700">
                              <FiAlertCircle size={16} />
                              <span className="text-sm">Audio URL not available</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <FiStar className="text-yellow-500" />
                            <span>Recommended for you</span>
                          </div>
                          {audioUrl && (
                            <button
                              onClick={() => {
                                const audioElement = document.querySelector(`audio[src="${audioUrl}"]`);
                                if (audioElement) {
                                  if (audioElement.paused) {
                                    audioElement.play();
                                  } else {
                                    audioElement.pause();
                                  }
                                }
                              }}
                              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1 hover:bg-green-100 px-2 py-1 rounded"
                            >
                              <FiPlay size={14} />
                              <span>Play</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Video Recommendations Grid */}
              {data?.recommendationType === "YOGA_EXCERSITE" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.recommendations.map((video, index) => (
                    <div key={index} className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <FiVideo className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-800 truncate">
                            {video.recommendName || video.videoName}
                          </h4>
                          <p className="text-blue-600 text-sm">Guided Exercise</p>
                        </div>
                      </div>
                      
                      <div className="relative mb-4">
                        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                          <button
                            onClick={() => openVideoModal(video)}
                            className="group-hover:scale-110 transition-transform p-4 bg-blue-500 rounded-full shadow-lg"
                          >
                            <FiPlay className="w-8 h-8 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FiStar className="text-yellow-500" />
                          <span>Recommended for you</span>
                        </div>
                        <button
                          onClick={() => openVideoModal(video)}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                        >
                          <FiMaximize size={14} />
                          <span>Watch</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Doctor Recommendations Grid */}
              {data?.recommendationType === "DOCTOR_ADVISE" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor, index) => (
                    <div key={index} className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                          {doctor.avtUrl ? (
                            <img 
                              src={doctor.avtUrl} 
                              alt={doctor.fullname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-100">
                              <FiUser className="w-8 h-8 text-purple-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-800 truncate">
                            Dr. {doctor.fullname}
                          </h4>
                          <p className="text-purple-600 text-sm">{doctor.specialization || 'General Practice'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FiCalendar size={14} />
                          <span>Available for consultation</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiStar className="text-yellow-500" size={14} />
                          <span>Verified Professional</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleSelectDoctor(doctor.id)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <FiMessageCircle size={16} />
                        <span>Consult Now</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Center */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Need More Support?</h3>
            <p className="text-gray-600 mb-8">Connect with our wellness community and get personalized guidance</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/chatroom')}
                className="group flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <FiMessageSquare className="mr-3 group-hover:scale-110 transition-transform" size={20} />
                Get Professional Advice
              </button>
              
              <button
                onClick={handleBackHome}
                className="group flex items-center px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <FiHome className="mr-3 group-hover:scale-110 transition-transform" size={20} />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col animate-scale-up">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6 flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FiVideo size={20} />
                </div>                <div>
                  <h3 className="font-bold text-lg">{videoModal.recommendName || videoModal.videoName}</h3>
                  <p className="text-green-100 text-sm">Guided Yoga Session</p>
                </div>
              </div>
              <button 
                onClick={closeVideoModal}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors group"
              >
                <FiX className="text-white group-hover:scale-110 transition-transform" size={20} />
              </button>
            </div>            <div className="p-8 overflow-y-auto flex-1 bg-gradient-to-br from-green-50 to-teal-50">
              <div className="bg-black rounded-2xl overflow-hidden">
                <video 
                  controls 
                  preload="metadata"
                  className="w-full h-auto"
                  style={{ maxHeight: 'calc(90vh - 200px)', minHeight: '400px' }}
                  crossOrigin="anonymous"                  onError={(e) => {
                    console.error("Video error:", e);
                    console.error("Video URL (recommendUrl):", videoModal.recommendUrl);
                    console.error("Video URL (videoUrl):", videoModal.videoUrl);
                  }}
                  onLoadStart={() => console.log("Video loading started")}
                  onCanPlay={() => console.log("Video can play")}
                >
                  <source src={videoModal.recommendUrl || videoModal.videoUrl} type="video/mp4" />
                  <source src={videoModal.recommendUrl || videoModal.videoUrl} type="video/webm" />
                  <source src={videoModal.recommendUrl || videoModal.videoUrl} type="video/ogg" />
                  <p className="text-white text-center p-8">
                    Your browser does not support the video tag or there's an issue loading the video.
                    <br />                    <a 
                      href={videoModal.recommendUrl || videoModal.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-300 underline mt-2 inline-block"
                    >
                      Click here to open video in new tab
                    </a>
                  </p>
                </video>
              </div>
              
              {/* Alternative iframe fallback */}
        
              
              {/* Debug info */}              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                <strong>Video URL:</strong> 
                <div className="break-all mt-1">{videoModal.recommendUrl || videoModal.videoUrl}</div>
                <div className="mt-2">
                  <strong>Direct Link:</strong> 
                  <a 
                    href={videoModal.recommendUrl || videoModal.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline ml-2"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t border-gray-200 bg-white flex justify-between items-center">
              <div className="flex items-center space-x-4 text-gray-600">
                <FiHeart className="text-red-500" />
                <span className="text-sm">Added to your wellness journey</span>
              </div>
              <button
                onClick={closeVideoModal}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Close Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}