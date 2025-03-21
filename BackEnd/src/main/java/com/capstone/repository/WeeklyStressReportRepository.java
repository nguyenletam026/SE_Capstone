package com.capstone.repository;

import com.capstone.entity.WeeklyStressReport;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WeeklyStressReportRepository extends JpaRepository<WeeklyStressReport, String> {
    List<WeeklyStressReport> findByUserOrderByStartDateDesc(User user);
    Optional<WeeklyStressReport> findByUserAndWeekNumberAndYear(User user, int weekNumber, int year);
} 