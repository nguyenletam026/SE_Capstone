import React, { useState, useEffect } from "react";
import { getDoctorSchedules, fetchDoctorInfo } from "../../lib/doctor/doctorScheduleServices";
import { useAuth } from "../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

// Import icons
import { 
  FaCalendarAlt, FaUserMd, FaSyncAlt, FaRegCalendarCheck, FaRegCalendarTimes, 
  FaInfoCircle, FaRegClock, FaClipboardList, FaRegHospital, FaUserInjured, 
  FaRegStar, FaBug, FaTimesCircle, FaChevronLeft, FaChevronRight, FaListUl,
  FaCalendarDay, FaCalendarWeek, FaPlusCircle, FaClock
} from "react-icons/fa";
import { 
  HiOutlineChevronRight, HiOutlineCalendar, HiOutlineClock, HiLocationMarker, 
  HiUserCircle, HiOutlineBadgeCheck, HiFilter 
} from "react-icons/hi";
import { MdOutlineEventAvailable, MdOutlineEventBusy } from "react-icons/md";

export default function DoctorSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list, calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);
  
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

  // Animate the refresh button
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setTimeout(() => setRefreshing(false), 600);
  };

  // Date navigation
  const goToPrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Fetch doctor info and schedules
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const doctorInfo = await fetchDoctorInfo();
      
      if (!doctorInfo || !doctorInfo.id) {
        console.error("Could not get doctor ID from myInfo API");
        showNotification("Không thể lấy thông tin bác sĩ. Vui lòng đăng nhập lại.", "error");
        setLoading(false);
        return;
      }
      
      setCurrentDoctor(doctorInfo);
      const doctorId = doctorInfo.id;
      const data = await getDoctorSchedules(doctorId);
      
      if (data.result && Array.isArray(data.result)) {
        const filteredSchedules = data.result.filter(schedule => {
          const scheduleDoctorId = schedule.doctorId || schedule.doctor?.id;
          return scheduleDoctorId === doctorId;
        });
        
        setSchedules(filteredSchedules);
      } else {
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

  const formatShortDate = (date) => {
    const options = { month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString("vi-VN", options);
  };

  const formatMonth = (date) => {
    const options = { month: "long", year: "numeric" };
    return new Date(date).toLocaleDateString("vi-VN", options);
  };

  // Format date to YYYY-MM-DD for comparison
  const formatDateForCompare = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  // Filter schedules by upcoming vs past
  const upcomingSchedules = schedules.filter(
    (schedule) => new Date(schedule.date) >= new Date().setHours(0, 0, 0, 0)
  ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date (earliest first)
  
  const pastSchedules = schedules.filter(
    (schedule) => new Date(schedule.date) < new Date().setHours(0, 0, 0, 0)
  ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (most recent first)

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    const compareDate = formatDateForCompare(date);
    return schedules.filter(schedule => formatDateForCompare(new Date(schedule.date)) === compareDate);
  };

  // Handle date click in calendar view
  const handleDateClick = (day) => {
    const clickDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickDate);
    
    const dateSchedules = getSchedulesForDate(clickDate);
    setSelectedDateSchedules(dateSchedules);
  };

  // Calendar generation
  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const today = new Date();

    // Days of week headers
    const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    
    // Generate empty cells for days before the first day of the month
    const calendarRows = [];
    let dayCounter = 1;
    let calendarCells = [];

    // Add day of week headers
    const weekdayHeaders = daysOfWeek.map((day, index) => (
      <div key={`header-${index}`} className="text-center text-sm font-medium py-2 text-gray-600 dark:text-gray-400">
        {day}
      </div>
    ));
    calendarRows.push(
      <div key="weekday-headers" className="grid grid-cols-7 gap-1 mb-2">
        {weekdayHeaders}
      </div>
    );

    // Calculate how many weeks we need to display
    const totalDays = firstDayOfMonth + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    // Build the weeks
    for (let week = 0; week < totalWeeks; week++) {
      calendarCells = [];
      
      // Build the days in each week
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        // Empty cells before the first day of the month
        if (week === 0 && dayOfWeek < firstDayOfMonth) {
          calendarCells.push(
            <div key={`empty-${dayOfWeek}`} className="calendar-day empty"></div>
          );
          // Cells for days after the last day of the month
        } else if (dayCounter > daysInMonth) {
          calendarCells.push(
            <div key={`empty-end-${dayCounter}`} className="calendar-day empty"></div>
          );
          dayCounter++;
        } else {
          // Regular day cells
          const date = new Date(year, month, dayCounter);
          const dateSchedules = getSchedulesForDate(date);
          const hasSchedules = dateSchedules.length > 0;
          const isToday = 
            date.getDate() === today.getDate() && 
            date.getMonth() === today.getMonth() && 
            date.getFullYear() === today.getFullYear();
          
          const isSelected = selectedDate && 
            date.getDate() === selectedDate.getDate() && 
            date.getMonth() === selectedDate.getMonth() && 
            date.getFullYear() === selectedDate.getFullYear();

          calendarCells.push(
            <div 
              key={`day-${dayCounter}`}
              onClick={() => handleDateClick(dayCounter)}
              className={`calendar-day relative p-2 
                         rounded-xl cursor-pointer transition-all border 
                         ${isToday ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'} 
                         ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40 shadow-md' : 
                                      hasSchedules ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : 
                                                   'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isToday ? 
                               'text-blue-600 dark:text-blue-400' : 
                               'text-gray-700 dark:text-gray-300'}`}>{dayCounter}</span>
                
                {hasSchedules && (
                  <div className={`text-xs px-1.5 py-0.5 rounded-full 
                                 ${dateSchedules.some(s => s.isAvailable) ? 
                                   'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                                   'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {dateSchedules.length}
                  </div>
                )}
              </div>
              
              {/* Show time schedules directly in calendar */}
              {hasSchedules && (
                <div className="time-slots mt-1">
                  {dateSchedules.length <= 3 ? (
                    dateSchedules.map((schedule, idx) => (
                      <div 
                        key={`schedule-${dayCounter}-${idx}`}
                        className={`text-xs py-0.5 px-1.5 mb-0.5 rounded flex items-center gap-1 
                                    truncate ${schedule.isAvailable ? 
                                    'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400' :
                                    'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400'}`}
                      >
                        <FaClock className="flex-shrink-0" size={10} />
                        <span className="truncate">{schedule.startTime}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs py-0.5 px-1.5 mb-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 flex items-center justify-center">
                      <span>{dateSchedules.length} lịch</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          
          dayCounter++;
        }
      }
      
      calendarRows.push(
        <div key={`week-${week}`} className="grid grid-cols-7 gap-1 mb-1">
          {calendarCells}
        </div>
      );
    }
    
    return calendarRows;
  };

  // Format status for visual display
  const getStatusInfo = (schedule) => {
    if (!schedule.isAvailable) {
      return {
        icon: <MdOutlineEventBusy size={18} />,
        label: "Không có sẵn",
        classes: "bg-red-50 text-red-600 border-red-200"
      };
    }
    
    const appointmentsRatio = schedule.currentAppointments / schedule.maxAppointments;
    if (appointmentsRatio >= 0.8) {
      return {
        icon: <HiOutlineBadgeCheck size={18} />,
        label: "Sắp đầy",
        classes: "bg-amber-50 text-amber-600 border-amber-200"
      };
    }
    
    return {
      icon: <MdOutlineEventAvailable size={18} />,
      label: "Có sẵn",
      classes: "bg-green-50 text-green-600 border-green-200"
    };
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Đang tải lịch làm việc...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 right-6 p-4 rounded-xl shadow-xl z-50 flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                : notification.type === "error"
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                : "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <HiOutlineBadgeCheck className="text-2xl" />
            ) : notification.type === "error" ? (
              <FaTimesCircle className="text-2xl" />
            ) : (
              <FaInfoCircle className="text-2xl" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info Modal */}
      <AnimatePresence>
        {debugInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <FaBug /> Debug Information
                </h2>
                <button
                  onClick={() => setDebugInfo(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaUserMd className="text-blue-500" /> User Object:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-48 text-xs">
                    {JSON.stringify(debugInfo.userObject, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaClipboardList className="text-green-500" /> LocalStorage User:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-48 text-xs">
                    {debugInfo.localStorage}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaRegHospital className="text-purple-500" /> Current Doctor:
                  </h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-48 text-xs">
                    {JSON.stringify(debugInfo.currentDoctor, null, 2)}
                  </pre>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setDebugInfo(null)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center gap-2 transition-all font-medium shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Date Details Modal */}
      <AnimatePresence>
        {selectedDate && selectedDateSchedules.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <FaCalendarDay />
                  {formatDate(selectedDate)}
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedDateSchedules.map((schedule) => {
                  const statusInfo = getStatusInfo(schedule);
                  
                  return (
                    <div 
                      key={schedule.id} 
                      className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <HiOutlineClock className="text-blue-500" />
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${statusInfo.classes}`}>
                          {statusInfo.icon}
                          <span className="text-sm font-medium">{statusInfo.label}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <FaUserInjured className="text-blue-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-bold">{schedule.currentAppointments}</span>/{schedule.maxAppointments} cuộc hẹn
                          </span>
                        </div>
                        
                        <button className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium">
                          Chi tiết
                          <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {schedule.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-2">
                            <FaClipboardList className="flex-shrink-0 w-4 h-4 text-blue-500 mt-0.5" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{schedule.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center gap-2 transition-all font-medium shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with fancy gradient background */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mb-2 flex items-center gap-3">
              <FaCalendarAlt className="text-blue-500" />
              Lịch Làm Việc
            </h1>
            {currentDoctor && (
              <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">
                <HiUserCircle className="text-xl text-blue-500" />
                <p className="font-medium">
                  {currentDoctor.firstName} {currentDoctor.lastName}
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                    {currentDoctor.role?.name === "DOCTOR" ? "Bác sĩ" : "Y tá"}
                  </span>
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400 text-sm">
              <FaRegClock className="text-yellow-500" />
              <p>Xem và quản lý lịch làm việc của bạn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={showDebugInfo}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              title="Debug User Info"
            >
              <FaBug />
              <span className="hidden md:inline font-medium">User Info</span>
            </button>
            <button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              disabled={refreshing}
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              <span className="hidden md:inline font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Type and Actions Bar */}
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              viewMode === "list" 
                ? "bg-blue-500 text-white shadow-md" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <FaListUl />
            <span>Danh sách</span>
          </button>
          <button 
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              viewMode === "calendar" 
                ? "bg-blue-500 text-white shadow-md" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <FaCalendarWeek />
            <span>Lịch tháng</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition shadow-sm hover:shadow-md">
            <FaPlusCircle />
            <span className="font-medium">Thêm lịch mới</span>
          </button>
          
          <button className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <HiFilter />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          {/* Calendar Header with Month/Year and Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {formatMonth(currentDate)}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={goToPrevMonth} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition"
              >
                <FaChevronLeft />
              </button>
              <button 
                onClick={goToToday} 
                className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition"
              >
                Hôm nay
              </button>
              <button 
                onClick={goToNextMonth} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="calendar-grid">
            {renderCalendar()}
          </div>
          
          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Có sẵn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Không có sẵn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Hôm nay</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule tabs with fancy design (Only shown in list view) */}
      {viewMode === "list" && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`flex-1 py-5 px-4 text-center transition-all font-medium flex items-center justify-center gap-2 ${
                  activeTab === "upcoming"
                    ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`}
              >
                <FaRegCalendarCheck className={activeTab === "upcoming" ? "text-blue-500" : "text-gray-400"} />
                <span>Sắp tới ({upcomingSchedules.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`flex-1 py-5 px-4 text-center transition-all font-medium flex items-center justify-center gap-2 ${
                  activeTab === "past"
                    ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`}
              >
                <FaRegCalendarTimes className={activeTab === "past" ? "text-blue-500" : "text-gray-400"} />
                <span>Đã qua ({pastSchedules.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedules list with modern cards (Only shown in list view) */}
      {viewMode === "list" && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "upcoming" && upcomingSchedules.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineCalendar className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Chưa có lịch sắp tới</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Bạn chưa có lịch làm việc nào sắp tới. Tại đây sẽ hiển thị lịch làm việc của bạn khi có.
                  </p>
                </div>
              </div>
            ) : activeTab === "past" && pastSchedules.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineCalendar className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Chưa có lịch đã qua</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Bạn chưa có lịch làm việc nào đã qua. Tại đây sẽ hiển thị lịch làm việc của bạn sau khi kết thúc.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === "upcoming" ? upcomingSchedules : pastSchedules).map((schedule) => {
                  const statusInfo = getStatusInfo(schedule);
                  const isToday = new Date(schedule.date).toDateString() === new Date().toDateString();
                  
                  return (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border ${isToday ? "border-blue-200 dark:border-blue-800" : "border-gray-100 dark:border-gray-700"} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                    >
                      {/* Card Header with Gradient */}
                      <div className={`p-1 ${isToday ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"}`}>
                        {isToday && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 float-right -mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> Hôm nay
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        {/* Date and Time */}
                        <div className="flex items-start mb-5">
                          <div className="mr-4 flex-shrink-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isToday ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                              <HiOutlineCalendar className="w-6 h-6" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              {formatDate(schedule.date)}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                              <HiOutlineClock className="w-4 h-4 text-blue-500" />
                              <p className="text-sm">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status and Appointments */}
                        <div className="flex items-center justify-between mt-4">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${statusInfo.classes}`}>
                            {statusInfo.icon}
                            <span className="text-sm font-medium">{statusInfo.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUserInjured className="text-blue-400" />
                            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                              <span className="font-bold">{schedule.currentAppointments}</span>/{schedule.maxAppointments}
                            </div>
                          </div>
                        </div>
                        
                        {/* Notes Section */}
                        {schedule.notes && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-2">
                              <FaClipboardList className="flex-shrink-0 w-4 h-4 text-blue-500 mt-0.5" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">{schedule.notes}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Card Footer */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                              <HiLocationMarker className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Phòng khám trực tuyến</span>
                          </div>
                          
                          {activeTab === "upcoming" && (
                            <button className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium">
                              Chi tiết
                              <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          
                          {activeTab === "past" && (
                            <div className="flex items-center gap-1">
                              <FaRegStar className="text-yellow-400" />
                              <FaRegStar className="text-yellow-400" />
                              <FaRegStar className="text-yellow-400" />
                              <FaRegStar className="text-yellow-400" />
                              <FaRegStar className="text-gray-300 dark:text-gray-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
      
      {/* CSS for calendar */}
      <style jsx>{`
        .calendar-grid {
          font-family: 'Inter', sans-serif;
        }
        .calendar-day {
          min-height: 100px;
        }
        .calendar-day.empty {
          background-color: rgba(249, 250, 251, 0.5);
        }
        @media (max-width: 640px) {
          .calendar-day {
            min-height: 80px;
          }
          .time-slots {
            max-height: 60px;
            overflow-y: auto;
          }
        }
        .time-slots {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}