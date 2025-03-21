package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "weekly_stress_report")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WeeklyStressReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    int weekNumber;
    int year;
    double averageStressScore;
    String dominantStressLevel;
    int totalAnalyses;

    @Temporal(TemporalType.TIMESTAMP)
    Date startDate;

    @Temporal(TemporalType.TIMESTAMP)
    Date endDate;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;
} 