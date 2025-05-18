package com.capstone.repository;

import com.capstone.entity.DoctorSchedule;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, String> {
    List<DoctorSchedule> findByDoctor(User doctor);
    List<DoctorSchedule> findByDoctorId(String doctorId);
    List<DoctorSchedule> findByDate(LocalDate date);
    List<DoctorSchedule> findByDoctorAndDate(User doctor, LocalDate date);
    List<DoctorSchedule> findByDateBetween(LocalDate startDate, LocalDate endDate);
} 