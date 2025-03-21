package com.capstone.repository;

import com.capstone.entity.MonthlyStressReport;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MonthlyStressReportRepository extends JpaRepository<MonthlyStressReport, String> {
    List<MonthlyStressReport> findByUserOrderByStartDateDesc(User user);
    Optional<MonthlyStressReport> findByUserAndMonthAndYear(User user, int month, int year);
} 