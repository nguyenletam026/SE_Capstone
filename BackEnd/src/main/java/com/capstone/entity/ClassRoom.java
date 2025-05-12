package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "class_rooms")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    String name;
    
    String description;
    
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    User teacher;
    
    @ManyToMany
    @JoinTable(
        name = "class_students",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @Builder.Default
    Set<User> students = new HashSet<>();
    
    LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
} 