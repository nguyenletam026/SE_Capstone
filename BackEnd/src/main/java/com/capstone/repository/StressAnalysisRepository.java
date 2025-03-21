package com.capstone.repository;

import com.capstone.entity.StressAnalysis;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Date;

public interface StressAnalysisRepository extends JpaRepository<StressAnalysis, String> {
    List<StressAnalysis> findByUserId(String userId);
    List<StressAnalysis> findByUserOrderByCreatedAtDesc(User user);
    List<StressAnalysis> findByUserAndCreatedAtBetween(User user, Date startDate, Date endDate);
}
