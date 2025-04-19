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
<<<<<<< HEAD
@Table(name = "doctor_upgrade_requests")
=======
@Table(name = "doctor_upgrade")
>>>>>>> hieuDev
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorUpgrade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

<<<<<<< HEAD
    @Lob
    @Column(nullable = false)
    byte[] certificateImage; // PostgreSQL dùng BYTEA thay vì BLOB
=======
    @Column(nullable = false)
    String certificateUrl;
>>>>>>> hieuDev

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    RequestStatus status;
<<<<<<< HEAD
=======

    String specialization;
    int experienceYears;
    String description;
    String phoneNumber;
    String hospital;
>>>>>>> hieuDev
}
