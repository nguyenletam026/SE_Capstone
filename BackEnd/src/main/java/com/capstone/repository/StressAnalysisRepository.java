package com.capstone.repository;

import com.capstone.entity.StressAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StressAnalysisRepository extends JpaRepository<StressAnalysis, String> {
    List<StressAnalysis> findByUserId(String userId);
}
