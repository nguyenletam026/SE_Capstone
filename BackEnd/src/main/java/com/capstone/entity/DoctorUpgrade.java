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
@Table(name = "doctor_upgrade_requests")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorUpgrade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Lob
    @Column(nullable = false)
    byte[] certificateImage; // PostgreSQL dùng BYTEA thay vì BLOB

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    RequestStatus status;
}
