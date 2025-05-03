package com.capstone.repository;

import com.capstone.entity.MusicRecommend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MusicRecommendRepository extends JpaRepository<MusicRecommend, String> {
    List<MusicRecommend> findByStressLevel(String stressLevel);
    Optional<MusicRecommend> findByMusicUrl(String musicUrl);
} 