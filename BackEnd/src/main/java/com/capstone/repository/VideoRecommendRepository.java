package com.capstone.repository;

import com.capstone.entity.VideoRecommend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRecommendRepository extends JpaRepository<VideoRecommend, String> {
    List<VideoRecommend> findByStressLevel(String stressLevel);
} 