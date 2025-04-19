package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "answers")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    // Selected option index (0-based)
    @Column(nullable = false)
    Integer selectedOptionIndex;
    
    // We'll keep the content field to store the text of the selected option
    @Column(nullable = false, length = 2000)
    String selectedOptionText;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    Question question;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    
    @Column(nullable = false)
    Double stressScore;
    
    @Column(length = 50)
    String stressLevel;
    
    @Column(nullable = false)
    LocalDateTime createdAt;
} 