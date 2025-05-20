import React, { useState, useEffect, useRef } from 'react';
import { 
  getDoctorSchedules, 
  createDoctorSchedule, 
  updateDoctorSchedule, 
  deleteDoctorSchedule 
} from '../../lib/admin/adminServices';
import { getApprovedDoctors } from '../../lib/admin/adminServices';
import { 
  FiCalendar, FiSearch, FiMoreVertical, FiPlus, FiX, FiList, FiGrid, 
  FiEdit2, FiTrash2, FiCheck, FiClock, FiUser, FiFilter, FiChevronLeft, 
  FiChevronRight, FiAlertCircle, FiFileText, FiUsers, FiBell,
  FiAlertTriangle, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

const AdminDoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [filter, setFilter] = useState('');
  const [dropdown, setDropdown] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeDoctor, setActiveDoctor] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const buttonRefs = useRef({});
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    maxAppointments: 8,
    notes: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [schedulesData, doctorsData] = await Promise.all([
        getDoctorSchedules(),
        getApprovedDoctors()
      ]);
      
      setSchedules(schedulesData);
      setDoctors(doctorsData);
      
      if (doctorsData && doctorsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          doctorId: doctorsData[0].id
        }));
      }
    } catch (error) {
      toast.error('Có lỗi khi tải dữ liệu lịch làm việc', {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentSchedule) {
        await updateDoctorSchedule(currentSchedule.id, formData);
        toast.success('Cập nhật lịch làm việc thành công');
      } else {
        await createDoctorSchedule(formData);
        toast.success('Tạo lịch làm việc mới thành công');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(currentSchedule ? 'Không thể cập nhật lịch làm việc' : 'Không thể tạo lịch làm việc mới');
    }
  };

  const handleDelete = async () => {
    if (!currentSchedule) return;
    
    try {
      await deleteDoctorSchedule(currentSchedule.id);
      toast.success('Đã xóa lịch làm việc thành công');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Không thể xóa lịch làm việc');
    }
  };

  const openEditModal = (schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxAppointments: schedule.maxAppointments,
      notes: schedule.notes || '',
      isAvailable: schedule.isAvailable
    });
    setIsModalOpen(true);
    setDropdown(null);
  };

  const openDeleteModal = (schedule) => {
    setCurrentSchedule(schedule);
    setIsDeleteModalOpen(true);
    setDropdown(null);
  };

  const openCreateModal = (date) => {
    if (doctors.length === 0) {
      toast.warning('Không có bác sĩ nào để tạo lịch. Vui lòng phê duyệt bác sĩ trước.');
      return;
    }
    
    setCurrentSchedule(null);
    resetForm();
    
    // If a date is provided, use it for the new schedule
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: format(date, 'yyyy-MM-dd')
      }));
    }
    
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      doctorId: doctors.length > 0 ? doctors[0].id : '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '17:00',
      maxAppointments: 8,
      notes: '',
      isAvailable: true
    });
  };

  const toggleDropdown = (id) => {
    const btn = buttonRefs.current[id];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdown((prev) =>
        prev?.id === id
          ? null
          : {
              id,
              top: rect.bottom + window.scrollY + 4,
              left: rect.right + window.scrollX - 192,
            }
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdown &&
        !document.getElementById('dropdown-menu')?.contains(e.target) &&
        !Object.values(buttonRefs.current).some((ref) => ref?.contains(e.target))
      ) {
        setDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdown]);

  // Filtering functions
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = filter === '' || 
      schedule.doctorName.toLowerCase().includes(filter.toLowerCase()) ||
      schedule.date.includes(filter);
    
    const matchesDoctor = activeDoctor === 'all' || schedule.doctorId === activeDoctor;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'available' && schedule.isAvailable) ||
      (statusFilter === 'unavailable' && !schedule.isAvailable);
    
    return matchesSearch && matchesDoctor && matchesStatus;
  });

  // Calendar view functions
  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getDayName = (date) => {
    return format(date, 'EEEE', { locale: vi });
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    
    return days;
  };

  const getSchedulesForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredSchedules.filter(schedule => schedule.date === dateStr);
  };

  const weekDays = getWeekDays();
  const weekStart = format(weekDays[0], 'dd/MM/yyyy');
  const weekEnd = format(weekDays[6], 'dd/MM/yyyy');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiCalendar className="mr-3 text-indigo-600" size={28} />
                Quản lý lịch làm việc bác sĩ
              </h1>
              <p className="text-gray-500 mt-1">Quản lý và điều chỉnh lịch làm việc cho bác sĩ trong hệ thống</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToToday()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Hôm nay
              </button>
              
              <button
                onClick={() => openCreateModal()}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                <FiPlus className="mr-2" />
                Thêm lịch mới
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search Box */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo tên bác sĩ hoặc ngày..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Doctor Filter */}
              <div className="w-full sm:w-64">
                <select
                  value={activeDoctor}
                  onChange={(e) => setActiveDoctor(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tất cả bác sĩ</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="available">Có sẵn</option>
                  <option value="unavailable">Không có sẵn</option>
                </select>
              </div>
            </div>
            
            {/* View Switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 h-10">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center px-3 py-1.5 rounded-md ${
                  viewMode === 'calendar'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiGrid className="mr-1.5" />
                Lịch
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-1.5 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiList className="mr-1.5" />
                Danh sách
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-lg font-medium text-gray-700">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && schedules.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
              <FiCalendar className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có lịch làm việc nào</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Bắt đầu bằng cách tạo lịch làm việc đầu tiên cho bác sĩ. Các lịch làm việc sẽ hiển thị ở đây.
            </p>
            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              <FiPlus className="mr-2" />
              Thêm lịch mới
            </button>
          </div>
        )}

        {/* List View */}
        {!isLoading && schedules.length > 0 && viewMode === 'list' && (
          <div className="bg-white overflow-hidden rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuộc hẹn</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{schedule.doctorName}</div>
                              <div className="text-xs text-gray-500">{schedule.specialization || "Chưa có chuyên khoa"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 text-gray-400" />
                            <div className="text-sm text-gray-900">{schedule.date}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiClock className="mr-2 text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FiUsers className="mr-2 text-gray-400" />
                            <div>
                              <span className={`font-medium ${schedule.currentAppointments >= schedule.maxAppointments ? 'text-red-500' : 'text-gray-900'}`}>
                                {schedule.currentAppointments}
                              </span> / {schedule.maxAppointments}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {schedule.isAvailable ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheckCircle className="mr-1" /> Có sẵn
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FiX className="mr-1" /> Không có sẵn
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {schedule.notes || "Không có ghi chú"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            ref={(el) => (buttonRefs.current[schedule.id] = el)}
                            onClick={() => toggleDropdown(schedule.id)}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                          >
                            <FiMoreVertical />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <FiAlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="font-medium text-gray-900 mb-1">Không tìm thấy lịch làm việc nào</p>
                        <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc tạo lịch mới</p>
                        <button
                          onClick={() => openCreateModal()}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                          <FiPlus className="mr-1.5" />
                          Thêm lịch mới
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View (without hourly divisions) */}
        {!isLoading && schedules.length > 0 && viewMode === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <button 
                onClick={prevWeek}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                aria-label="Previous week"
              >
                <FiChevronLeft size={20} />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <FiCalendar className="text-indigo-500 mr-2" />
                <span>{weekStart} - {weekEnd}</span>
              </h2>
              
              <button 
                onClick={nextWeek}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
                aria-label="Next week"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`text-center py-3 ${isToday(day) ? 'bg-indigo-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-0.5 ${isToday(day) ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {getDayName(day)}
                  </div>
                  <div className="text-xs text-gray-500">{format(day, 'dd/MM')}</div>
                  
                  {isToday(day) && (
                    <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mt-1"></span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Calendar Days Content */}
            <div className="grid grid-cols-7">
              {weekDays.map((day, dayIndex) => {
                const daySchedules = getSchedulesForDay(day);
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`border-r last:border-r-0 min-h-[400px] ${isToday(day) ? 'bg-indigo-50 bg-opacity-50' : ''}`}
                  >
                    <div className="p-3">
                      {daySchedules.length > 0 ? (
                        <div className="space-y-3">
                          {daySchedules.map((schedule) => (
                            <div 
                              key={schedule.id} 
                              className={`p-3 rounded-lg text-sm border-l-4 ${
                                schedule.isAvailable 
                                  ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                                  : 'border-red-500 bg-red-50 hover:bg-red-100'
                              } transition-colors cursor-pointer shadow-sm`}
                              onClick={() => openEditModal(schedule)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-medium truncate flex-grow">{schedule.doctorName}</div>
                                <button
                                  ref={(el) => (buttonRefs.current[`cal-${schedule.id}`] = el)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(`cal-${schedule.id}`);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 focus:outline-none p-0.5 flex-shrink-0"
                                >
                                  <FiMoreVertical />
                                </button>
                              </div>
                              
                              <div className="mt-2 flex items-center text-xs text-gray-600">
                                <FiClock className="mr-1" /> {schedule.startTime} - {schedule.endTime}
                              </div>
                              
                              <div className="mt-1 flex items-center justify-between">
                                <div 
                                  className={`flex items-center text-xs ${
                                    schedule.currentAppointments >= schedule.maxAppointments
                                      ? 'text-red-700'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  <FiUsers className="mr-1" />
                                  <span>{schedule.currentAppointments}/{schedule.maxAppointments}</span>
                                </div>
                                
                                {schedule.notes && (
                                  <Tooltip title={schedule.notes}>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <FiFileText className="mr-1" />
                                      <span>Ghi chú</span>
                                    </div>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                          <button
                            onClick={() => openCreateModal(day)}
                            className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-400 transition-colors w-full"
                          >
                            <FiPlus className="mr-1" /> Thêm lịch mới
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dropdown Menu */}
        {dropdown && (
          <div
            id="dropdown-menu"
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fadeIn"
            style={{
              top: `${dropdown.top}px`,
              left: `${dropdown.left}px`,
              width: '160px',
            }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  const id = dropdown.id.startsWith('cal-') 
                    ? dropdown.id.substring(4) 
                    : dropdown.id;
                  openEditModal(schedules.find((s) => s.id === id));
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiEdit2 className="mr-3 text-gray-500" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => {
                  const id = dropdown.id.startsWith('cal-') 
                    ? dropdown.id.substring(4) 
                    : dropdown.id;
                  openDeleteModal(schedules.find((s) => s.id === id));
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <FiTrash2 className="mr-3 text-red-500" />
                Xóa lịch
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg transform transition-all animate-fadeIn"
              style={{maxHeight: '90vh', overflow: 'auto'}}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FiCalendar className={`mr-3 ${currentSchedule ? 'text-amber-500' : 'text-indigo-600'}`} />
                  {currentSchedule ? 'Chỉnh sửa lịch làm việc' : 'Tạo lịch làm việc mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn bác sĩ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.firstName} {doctor.lastName} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày làm việc <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <FiCalendar className="text-gray-400 mr-2" />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <FiClock className="text-gray-400 mr-2" />
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian kết thúc <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <FiClock className="text-gray-400 mr-2" />
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="maxAppointments" className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng cuộc hẹn tối đa <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <FiUsers className="text-gray-400 mr-2" />
                    <input
                      type="number"
                      id="maxAppointments"
                      name="maxAppointments"
                      value={formData.maxAppointments}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Số lượng bệnh nhân tối đa có thể đặt hẹn trong khung giờ này</p>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú (Tùy chọn)
                  </label>
                  <div className="flex">
                    <FiFileText className="text-gray-400 mr-2 mt-3" />
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Thêm ghi chú về lịch làm việc này..."
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                      Trạng thái có sẵn để đặt lịch
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">Khi không chọn, bệnh nhân sẽ không thể đặt lịch trong khung giờ này</p>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      currentSchedule 
                        ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    }`}
                  >
                    {currentSchedule ? 'Cập nhật' : 'Tạo lịch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all animate-fadeIn">
              <div className="flex items-center justify-center mb-6 text-red-500">
                <div className="bg-red-100 rounded-full p-3">
                  <FiAlertTriangle size={24} />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Xác nhận xóa lịch làm việc
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Bạn có chắc chắn muốn xóa lịch làm việc này? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các cuộc hẹn đã đặt.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Xóa lịch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple tooltip component
const Tooltip = ({ children, title }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
          {title}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
      {children}
    </div>
  );
};

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default AdminDoctorSchedule;