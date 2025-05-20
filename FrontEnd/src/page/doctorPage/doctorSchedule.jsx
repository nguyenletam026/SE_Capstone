import React, { useState, useEffect } from "react";
import { getDoctorSchedules, fetchDoctorInfo } from "../../lib/doctor/doctorScheduleServices";
import { FaCalendarAlt, FaBug, FaUserMd } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // Hiển thị thông tin debug
  const showDebugInfo = () => {
    setDebugInfo({
      userObject: user,
      userJSON: JSON.stringify(user, null, 2),
      currentDoctor: currentDoctor,
      localStorage: localStorage.getItem('user')
    });
    showNotification("Đang hiển thị thông tin debug", "info");
  };

  // Fetch doctor info and schedules
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // Fetch doctor info from myInfo API
      const doctorInfo = await fetchDoctorInfo();
      
      if (!doctorInfo || !doctorInfo.id) {
        console.error("Could not get doctor ID from myInfo API");
        showNotification("Không thể lấy thông tin bác sĩ. Vui lòng đăng nhập lại.", "error");
        setLoading(false);
        return;
      }
      
      // Save current doctor info
      setCurrentDoctor(doctorInfo);
      console.log("Current doctor from API:", doctorInfo);
      
      // Use doctor ID from myInfo API
      const doctorId = doctorInfo.id;
      console.log("Using doctor ID from myInfo API:", doctorId);
      
      // Fetch schedules with doctor ID
      const data = await getDoctorSchedules(doctorId);
      
      if (data.result && Array.isArray(data.result)) {
        // Strict filtering - ONLY show schedules belonging to the current doctor
        const filteredSchedules = data.result.filter(schedule => {
          const scheduleDoctorId = schedule.doctorId || schedule.doctor?.id;
          const isCurrentDoctorSchedule = scheduleDoctorId === doctorId;
          console.log(`Schedule ${schedule.id} belongs to doctor ${scheduleDoctorId}, match with current doctor: ${isCurrentDoctorSchedule}`);
          return isCurrentDoctorSchedule;
        });
        
        console.log("Filtered schedules for current doctor:", filteredSchedules);
        setSchedules(filteredSchedules);
      } else {
        console.log("No schedules found or invalid data format:", data);
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error in fetchSchedules:", error);
      showNotification("Không thể tải lịch làm việc", "error");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Helper functions
  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Filter schedules by upcoming vs past
  const upcomingSchedules = schedules.filter(
    (schedule) => new Date(schedule.date) >= new Date().setHours(0, 0, 0, 0)
  );
  
  const pastSchedules = schedules.filter(
    (schedule) => new Date(schedule.date) < new Date().setHours(0, 0, 0, 0)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Debug Info Modal */}
      {debugInfo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Debug Information</h2>
            <div className="mb-4">
              <h3 className="font-semibold">User Object:</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-48 text-xs">
                {JSON.stringify(debugInfo.userObject, null, 2)}
              </pre>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold">LocalStorage User:</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-48 text-xs">
                {debugInfo.localStorage}
              </pre>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold">Current Doctor:</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-48 text-xs">
                {JSON.stringify(debugInfo.currentDoctor, null, 2)}
              </pre>
            </div>
            <button
              onClick={() => setDebugInfo(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Lịch làm việc</h1>
            {currentDoctor && (
              <p className="text-gray-600 mt-1">
                Bác sĩ: {currentDoctor.firstName} {currentDoctor.lastName}
                {currentDoctor.role?.name === "DOCTOR" && " - Bác sĩ"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={showDebugInfo}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition mr-2"
              title="Debug User Info"
            >
              <FaUserMd />
              <span className="hidden md:inline">User Info</span>
            </button>
            <button
              onClick={fetchSchedules}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              title="Refresh Schedules"
            >
              <FaCalendarAlt />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Xem lịch làm việc và các buổi hẹn với bệnh nhân
        </p>
      </div>

      {/* Schedule tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Lịch sắp tới của tôi ({upcomingSchedules.length})
            </button>
            <button
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ml-8"
            >
              Lịch đã qua của tôi ({pastSchedules.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Schedules list */}
      {upcomingSchedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Bạn chưa có lịch làm việc nào sắp tới</p>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <FaCalendarAlt className="text-lg" />
            <span>Chỉ hiển thị lịch làm việc của bạn tại đây</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {formatDate(schedule.date)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        schedule.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {schedule.isAvailable ? "Có sẵn" : "Không có sẵn"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{schedule.currentAppointments}</span>/{schedule.maxAppointments} cuộc hẹn
                  </div>
                </div>

                {schedule.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{schedule.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 