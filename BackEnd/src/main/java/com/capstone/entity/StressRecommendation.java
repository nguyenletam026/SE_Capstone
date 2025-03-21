package com.capstone.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "stress_recommendations")
public class StressRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category; // EXERCISE, MEDITATION, LIFESTYLE, BREATHING, etc.

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "stress_level", nullable = false)
    private String stressLevel; // Maps to your StressLevel enum

    @Column(name = "time_required")
    private Integer timeRequired; // in minutes

    @Column(name = "difficulty_level")
    private String difficultyLevel; // EASY, MEDIUM, HARD

    private String benefits;
} 