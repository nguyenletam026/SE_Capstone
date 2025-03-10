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
@Table(name = "stress_analysis")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StressAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    double stressScore;
    String stressLevel;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;
}
