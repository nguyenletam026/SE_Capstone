package com.capstone.service;

import com.capstone.dto.request.DoctorScheduleRequest;
import com.capstone.dto.response.DoctorScheduleResponse;
import com.capstone.entity.DoctorSchedule;
import com.capstone.entity.DoctorUpgrade;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.DoctorScheduleRepository;
import com.capstone.repository.DoctorUpgradeRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final UserRepository userRepository;
    private final DoctorUpgradeRepository doctorUpgradeRepository;

    @Transactional
    public DoctorScheduleResponse createSchedule(DoctorScheduleRequest request) {
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Check if user is a doctor
        if (!doctor.getRole().getName().equals("DOCTOR")) {
            throw new AppException(ErrorCode.USER_NOT_DOCTOR);
        }
        
        // Validate time range
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_RANGE);
        }
        
        DoctorSchedule schedule = DoctorSchedule.builder()
                .doctor(doctor)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .maxAppointments(request.getMaxAppointments())
                .currentAppointments(0)
                .notes(request.getNotes())
                .isAvailable(request.getIsAvailable())
                .build();
        
        DoctorSchedule savedSchedule = doctorScheduleRepository.save(schedule);
        return mapToResponse(savedSchedule);
    }
    
    public List<DoctorScheduleResponse> getAllSchedules() {
        return doctorScheduleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<DoctorScheduleResponse> getSchedulesByDoctorId(String doctorId) {
        return doctorScheduleRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<DoctorScheduleResponse> getSchedulesByDate(LocalDate date) {
        return doctorScheduleRepository.findByDate(date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<DoctorScheduleResponse> getSchedulesByDateRange(LocalDate startDate, LocalDate endDate) {
        return doctorScheduleRepository.findByDateBetween(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<User> getDoctorsByDate(LocalDate date) {
        System.out.println("Finding doctors for date: " + date);
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDate(date);
        System.out.println("Found " + schedules.size() + " schedules for date " + date);
        
        if (schedules.isEmpty()) {
            System.out.println("No schedules found for date: " + date);
            return List.of(); // Return empty list instead of all doctors
        }
        
        // Get current time for time-based filtering
        LocalDate currentDate = LocalDate.now();
        java.time.LocalTime currentTime = java.time.LocalTime.now();
        System.out.println("Current time: " + currentTime);
        
        List<User> doctors = schedules.stream()
                .filter(schedule -> {
                    boolean isAvailable = schedule.getIsAvailable();
                    
                    // For current day, check if current time is within the doctor's schedule
                    if (date.equals(currentDate)) {
                        boolean isTimeInRange = !currentTime.isBefore(schedule.getStartTime()) && 
                                              !currentTime.isAfter(schedule.getEndTime());
                        System.out.println("Schedule ID: " + schedule.getId() + 
                                      ", Doctor: " + schedule.getDoctor().getFirstName() + " " + 
                                      schedule.getDoctor().getLastName() + 
                                      ", isAvailable: " + isAvailable +
                                      ", startTime: " + schedule.getStartTime() +
                                      ", endTime: " + schedule.getEndTime() +
                                      ", isTimeInRange: " + isTimeInRange);
                        return isAvailable && isTimeInRange;
                    }
                    
                    // For future dates, just check availability
                    System.out.println("Schedule ID: " + schedule.getId() + 
                                      ", Doctor: " + schedule.getDoctor().getFirstName() + " " + 
                                      schedule.getDoctor().getLastName() + 
                                      ", isAvailable: " + isAvailable);
                    return isAvailable;
                })
                .map(DoctorSchedule::getDoctor)
                .distinct()
                .collect(Collectors.toList());
        
        System.out.println("Returning " + doctors.size() + " available doctors for date " + date);
        doctors.forEach(doctor -> 
            System.out.println("Doctor ID: " + doctor.getId() + 
                              ", Name: " + doctor.getFirstName() + " " + doctor.getLastName()));
        
        return doctors;
    }
    
    public List<User> getDoctorsByDateTime(LocalDate date, java.time.LocalTime time) {
        System.out.println("Finding doctors for date: " + date + " and time: " + time);
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDate(date);
        System.out.println("Found " + schedules.size() + " schedules for date " + date);
        
        if (schedules.isEmpty()) {
            System.out.println("No schedules found for date: " + date);
            return List.of();
        }
        
        List<User> doctors = schedules.stream()
                .filter(schedule -> {
                    boolean isAvailable = schedule.getIsAvailable();
                    boolean isTimeInRange = !time.isBefore(schedule.getStartTime()) && 
                                          !time.isAfter(schedule.getEndTime());
                    
                    System.out.println("Schedule ID: " + schedule.getId() + 
                                      ", Doctor: " + schedule.getDoctor().getFirstName() + " " + 
                                      schedule.getDoctor().getLastName() + 
                                      ", isAvailable: " + isAvailable +
                                      ", startTime: " + schedule.getStartTime() +
                                      ", endTime: " + schedule.getEndTime() +
                                      ", isTimeInRange: " + isTimeInRange);
                    
                    return isAvailable && isTimeInRange;
                })
                .map(DoctorSchedule::getDoctor)
                .distinct()
                .collect(Collectors.toList());
        
        System.out.println("Returning " + doctors.size() + " available doctors for date " + date + " and time " + time);
        doctors.forEach(doctor -> 
            System.out.println("Doctor ID: " + doctor.getId() + 
                              ", Name: " + doctor.getFirstName() + " " + doctor.getLastName()));
        
        return doctors;
    }
    
    @Transactional
    public DoctorScheduleResponse updateSchedule(String scheduleId, DoctorScheduleRequest request) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
        
        // Validate time range
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new AppException(ErrorCode.INVALID_TIME_RANGE);
        }
        
        // Update fields
        if (request.getDoctorId() != null && !request.getDoctorId().equals(schedule.getDoctor().getId())) {
            User doctor = userRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            
            // Check if user is a doctor
            if (!doctor.getRole().getName().equals("DOCTOR")) {
                throw new AppException(ErrorCode.USER_NOT_DOCTOR);
            }
            
            schedule.setDoctor(doctor);
        }
        
        schedule.setDate(request.getDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setMaxAppointments(request.getMaxAppointments());
        schedule.setNotes(request.getNotes());
        schedule.setIsAvailable(request.getIsAvailable());
        
        DoctorSchedule updatedSchedule = doctorScheduleRepository.save(schedule);
        return mapToResponse(updatedSchedule);
    }
    
    @Transactional
    public void deleteSchedule(String scheduleId) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
        
        doctorScheduleRepository.delete(schedule);
    }
    
    /**
     * Check if a doctor has available appointment slots right now
     */
    public Optional<DoctorSchedule> findAvailableScheduleForDoctor(User doctor) {
        LocalDate currentDate = LocalDate.now();
        java.time.LocalTime currentTime = java.time.LocalTime.now();
        
        return doctorScheduleRepository.findAvailableScheduleForDoctorNow(doctor, currentDate, currentTime);
    }
    
    /**
     * Atomically book an appointment slot - returns true if successful, false if no slots available
     */
    @Transactional
    public boolean bookAppointmentSlot(String scheduleId) {
        int updatedRows = doctorScheduleRepository.incrementCurrentAppointments(scheduleId);
        return updatedRows > 0;
    }
    
    /**
     * Release an appointment slot (when booking is cancelled or expires)
     */
    @Transactional
    public boolean releaseAppointmentSlot(String scheduleId) {
        int updatedRows = doctorScheduleRepository.decrementCurrentAppointments(scheduleId);
        return updatedRows > 0;
    }
      /**
     * Get doctors that have available appointment slots at the specified date and time
     */
    public List<User> getDoctorsWithAvailableSlots(LocalDate date, java.time.LocalTime time) {
        System.out.println("Finding doctors with available slots for date: " + date + " and time: " + time);
        
        // First get all schedules for this date 
        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDate(date);
        System.out.println("Found " + schedules.size() + " schedules for date: " + date);
        
        if (schedules.isEmpty()) {
            System.out.println("No schedules found for date: " + date);
            return List.of();
        }
        
        // Filter schedules by time and available slots
        List<User> doctors = schedules.stream()
                .filter(schedule -> {
                    // Check if schedule is available at the requested time
                    boolean isTimeInRange = !time.isBefore(schedule.getStartTime()) && 
                                       !time.isAfter(schedule.getEndTime());
                    
                    // Check if schedule has available capacity and is marked as available
                    boolean hasSlots = schedule.getCurrentAppointments() < schedule.getMaxAppointments() 
                                     && schedule.getIsAvailable();
                    
                    // Debug logging
                    System.out.println("Schedule ID: " + schedule.getId() + 
                                      ", Doctor: " + schedule.getDoctor().getFirstName() + " " + 
                                      schedule.getDoctor().getLastName() + 
                                      ", isTimeInRange: " + isTimeInRange +
                                      ", currentAppointments: " + schedule.getCurrentAppointments() +
                                      ", maxAppointments: " + schedule.getMaxAppointments() +
                                      ", isAvailable: " + schedule.getIsAvailable() +
                                      ", hasAvailableSlots: " + (hasSlots && isTimeInRange));
                    
                    return isTimeInRange && hasSlots;
                })
                .map(DoctorSchedule::getDoctor)
                .distinct()
                .collect(Collectors.toList());
        
        System.out.println("Returning " + doctors.size() + " doctors with available slots");
        return doctors;
    }
    
    private DoctorScheduleResponse mapToResponse(DoctorSchedule schedule) {
        User doctor = schedule.getDoctor();
        String specialization = "";
        
        // Get doctor specialization from DoctorUpgrade
        Optional<DoctorUpgrade> doctorUpgradeOpt = doctorUpgradeRepository.findLatestByUser(doctor);
        if (doctorUpgradeOpt.isPresent()) {
            specialization = doctorUpgradeOpt.get().getSpecialization();
        }
        
        return DoctorScheduleResponse.builder()
                .id(schedule.getId())
                .doctorId(doctor.getId())
                .doctorName(doctor.getFirstName() + " " + doctor.getLastName())
                .specialization(specialization)
                .date(schedule.getDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .maxAppointments(schedule.getMaxAppointments())
                .currentAppointments(schedule.getCurrentAppointments())
                .notes(schedule.getNotes())
                .isAvailable(schedule.getIsAvailable())
                .build();
    }
}