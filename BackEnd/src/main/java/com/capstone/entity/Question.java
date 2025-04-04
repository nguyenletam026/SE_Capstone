package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "questions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @Column(nullable = false, length = 1000)
    String content;
    
    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text", nullable = false)
    List<String> options;
    
    @ElementCollection
    @CollectionTable(name = "option_stress_scores", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "stress_score", nullable = false)
    List<Double> optionStressScores;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    User createdBy;
    
    @Column(nullable = false)
    LocalDateTime createdAt;
} 