import React, { useState, useEffect, useRef } from 'react';
import { 
  getDoctorSchedules, 
  createDoctorSchedule, 
  updateDoctorSchedule, 
  deleteDoctorSchedule 
} from '../../lib/admin/adminServices';
import { getApprovedDoctors } from '../../lib/admin/adminServices';
import { HiSearch, HiDotsVertical, HiCalendar, HiPlus, HiX, HiViewList, HiViewGrid } from 'react-icons/hi';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, startOfWeek, endOfWeek, addDays, parseISO, addWeeks, subWeeks } from 'date-fns';
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const buttonRefs = useRef({});
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    maxAppointments: 10,
    notes: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchSchedules();
    fetchDoctors();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await getDoctorSchedules();
      setSchedules(data);
    } catch (error) {
      toast.error('Failed to load schedules');
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await getApprovedDoctors();
      setDoctors(data);
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          doctorId: data[0].id
        }));
      } else {
        toast.warning('Không tìm thấy bác sĩ nào. Vui lòng phê duyệt bác sĩ trước khi tạo lịch.');
      }
    } catch (error) {
      toast.error('Failed to load doctors');
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
        toast.success('Schedule updated successfully');
      } else {
        await createDoctorSchedule(formData);
        toast.success('Schedule created successfully');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      toast.error(currentSchedule ? 'Failed to update schedule' : 'Failed to create schedule');
    }
  };

  const handleDelete = async () => {
    if (!currentSchedule) return;
    
    try {
      await deleteDoctorSchedule(currentSchedule.id);
      toast.success('Schedule deleted successfully');
      setIsDeleteModalOpen(false);
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
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
      maxAppointments: 10,
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

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.doctorName.toLowerCase().includes(filter.toLowerCase()) ||
      schedule.date.includes(filter)
  );

  // Calendar view functions
  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
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
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  const weekDays = getWeekDays();
  const weekStart = format(weekDays[0], 'dd/MM/yyyy');
  const weekEnd = format(weekDays[6], 'dd/MM/yyyy');

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HiCalendar className="text-blue-600" />
        Quản lý lịch làm việc bác sĩ
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <HiSearch />
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên bác sĩ hoặc ngày..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              <HiViewList className="mr-1" /> Danh sách
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 flex items-center ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              <HiViewGrid className="mr-1" /> Lịch tuần
            </button>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <HiPlus />
            Thêm lịch mới
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto rounded-lg shadow relative">
          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 border-b">Bác sĩ</th>
                <th className="px-4 py-3 border-b">Ngày</th>
                <th className="px-4 py-3 border-b">Giờ</th>
                <th className="px-4 py-3 border-b">Lượt hẹn</th>
                <th className="px-4 py-3 border-b">Trạng thái</th>
                <th className="px-4 py-3 border-b">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-4 py-4 border-b font-medium text-gray-800">
                    {schedule.doctorName}
                    <div className="text-xs text-gray-500">{schedule.specialization}</div>
                  </td>
                  <td className="px-4 py-4 border-b">{schedule.date}</td>
                  <td className="px-4 py-4 border-b">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-4 py-4 border-b">
                    {schedule.currentAppointments} / {schedule.maxAppointments}
                  </td>
                  <td className="px-4 py-4 border-b">
                    {schedule.isAvailable ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" /> Có sẵn
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FaTimesCircle className="mr-1" /> Không có sẵn
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 border-b text-right">
                    <button
                      ref={(el) => (buttonRefs.current[schedule.id] = el)}
                      onClick={() => toggleDropdown(schedule.id)}
                      className="text-gray-600 hover:text-black"
                    >
                      <HiDotsVertical className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy lịch nào. Tạo lịch mới để bắt đầu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center bg-gray-100 p-4 border-b">
            <button 
              onClick={prevWeek}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <FaChevronLeft />
            </button>
            
            <h3 className="text-lg font-medium text-gray-800">
              {weekStart} - {weekEnd}
            </h3>
            
            <button 
              onClick={nextWeek}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <FaChevronRight />
            </button>
          </div>
          
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className="border-r last:border-r-0 p-2 text-center font-medium bg-gray-50"
              >
                <div className="text-sm text-gray-800">{getDayName(day)}</div>
                <div className="text-xs text-gray-500">{format(day, 'dd/MM')}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 min-h-[500px]">
            {weekDays.map((day, dayIndex) => {
              const daySchedules = getSchedulesForDay(day);
              
              return (
                <div 
                  key={dayIndex} 
                  className="border-r last:border-r-0 p-2 overflow-y-auto max-h-[500px]"
                >
                  {daySchedules.length > 0 ? (
                    daySchedules.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        className={`mb-2 p-2 rounded text-sm ${
                          schedule.isAvailable 
                            ? 'bg-green-50 border-l-4 border-green-500' 
                            : 'bg-red-50 border-l-4 border-red-500'
                        }`}
                      >
                        <div className="font-medium">{schedule.doctorName}</div>
                        <div className="text-xs text-gray-500">{schedule.specialization}</div>
                        <div className="mt-1 flex justify-between items-center">
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                          <button
                            ref={(el) => (buttonRefs.current[`cal-${schedule.id}`] = el)}
                            onClick={() => toggleDropdown(`cal-${schedule.id}`)}
                            className="text-gray-600 hover:text-black"
                          >
                            <HiDotsVertical />
                          </button>
                        </div>
                        <div className="mt-1 text-xs">
                          {schedule.currentAppointments} / {schedule.maxAppointments} lượt hẹn
                        </div>
                      </div>
                    ))
                  ) : (
                    <div 
                      className="h-full flex items-center justify-center text-gray-400 text-sm"
                      onClick={() => openCreateModal(day)}
                    >
                      <button className="p-2 border border-dashed border-gray-300 rounded w-full text-center hover:bg-gray-50">
                        + Thêm lịch
                      </button>
                    </div>
                  )}
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
          className="fixed z-50 bg-white border rounded-xl shadow-lg w-48 animate-fade-in"
          style={{
            top: `${dropdown.top}px`,
            left: `${dropdown.left}px`,
          }}
        >
          <ul className="text-sm text-gray-700">
            <li>
              <button
                onClick={() => {
                  const id = dropdown.id.startsWith('cal-') 
                    ? dropdown.id.substring(4) 
                    : dropdown.id;
                  openEditModal(schedules.find((s) => s.id === id));
                }}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100 text-blue-600"
              >
                <FaEdit className="mr-2" />
                Chỉnh sửa
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  const id = dropdown.id.startsWith('cal-') 
                    ? dropdown.id.substring(4) 
                    : dropdown.id;
                  openDeleteModal(schedules.find((s) => s.id === id));
                }}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                <FaTrash className="mr-2" />
                Xóa lịch
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {currentSchedule ? 'Chỉnh sửa lịch' : 'Tạo lịch mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Bác sĩ
                </label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn bác sĩ</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'Chưa có chuyên khoa'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Ngày
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Số lượng cuộc hẹn tối đa
                </label>
                <input
                  type="number"
                  name="maxAppointments"
                  value={formData.maxAppointments}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Có sẵn để đặt lịch
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Xác nhận xóa</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa lịch này? Hành động này không thể hoàn tác.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorSchedule; 