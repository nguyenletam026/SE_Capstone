package com.capstone.repository;

import com.capstone.entity.DoctorSchedule;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, String> {
    List<DoctorSchedule> findByDoctor(User doctor);
    List<DoctorSchedule> findByDoctorId(String doctorId);
    List<DoctorSchedule> findByDate(LocalDate date);
    List<DoctorSchedule> findByDoctorAndDate(User doctor, LocalDate date);
    List<DoctorSchedule> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find available schedule for a doctor on current date/time
    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.doctor = :doctor " +
           "AND ds.date = :date " +
           "AND ds.startTime <= :currentTime " +
           "AND ds.endTime > :currentTime " +
           "AND ds.isAvailable = true " +
           "AND ds.currentAppointments < ds.maxAppointments")
    Optional<DoctorSchedule> findAvailableScheduleForDoctorNow(
        @Param("doctor") User doctor,
        @Param("date") LocalDate date,
        @Param("currentTime") LocalTime currentTime
    );
    
    // Atomically increment current appointments (with optimistic locking)
    @Modifying
    @Query("UPDATE DoctorSchedule ds SET ds.currentAppointments = ds.currentAppointments + 1 " +
           "WHERE ds.id = :scheduleId " +
           "AND ds.currentAppointments < ds.maxAppointments " +
           "AND ds.isAvailable = true")
    int incrementCurrentAppointments(@Param("scheduleId") String scheduleId);
    
    // Atomically decrement current appointments
    @Modifying
    @Query("UPDATE DoctorSchedule ds SET ds.currentAppointments = ds.currentAppointments - 1 " +
           "WHERE ds.id = :scheduleId " +
           "AND ds.currentAppointments > 0")
    int decrementCurrentAppointments(@Param("scheduleId") String scheduleId);
    
    // Find schedules by date and time that have available slots
    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.date = :date " +
           "AND ds.startTime <= :currentTime " +
           "AND ds.endTime > :currentTime " +
           "AND ds.isAvailable = true " +
           "AND ds.currentAppointments < ds.maxAppointments")
    List<DoctorSchedule> findByDateAndTimeWithAvailableSlots(
        @Param("date") LocalDate date,
        @Param("currentTime") LocalTime currentTime
    );
}