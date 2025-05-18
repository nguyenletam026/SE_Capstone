package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "doctor_schedules")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    User doctor;

    @Column(nullable = false)
    LocalDate date;

    @Column(nullable = false)
    LocalTime startTime;

    @Column(nullable = false)
    LocalTime endTime;

    @Column(nullable = false)
    Integer maxAppointments;
    
    @Column(nullable = false)
    Integer currentAppointments;
    
    @Column(length = 500)
    String notes;
    
    @Column(nullable = false)
    Boolean isAvailable;
} 