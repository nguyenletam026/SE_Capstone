package com.capstone.repository;

import com.capstone.entity.MusicRecommend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MusicRecommendRepository extends JpaRepository<MusicRecommend, String> {
    List<MusicRecommend> findByStressLevel(String stressLevel);
} 