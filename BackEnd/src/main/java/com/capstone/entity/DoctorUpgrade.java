package com.capstone.entity;

import com.capstone.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "doctor_upgrade")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorUpgrade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(nullable = false)
    String certificateUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    RequestStatus status;

    String specialization;
    int experienceYears;
    String description;
    String phoneNumber;
    String hospital;
}
