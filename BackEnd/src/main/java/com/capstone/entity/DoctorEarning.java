package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_earnings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorEarning {
    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    @OneToOne
    @JoinColumn(name = "chat_payment_id", nullable = false)
    private ChatPayment chatPayment;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount; // Total payment amount

    @Column(name = "commission_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionPercentage; // Doctor's commission percentage

    @Column(name = "doctor_earning", nullable = false, precision = 19, scale = 2)
    private BigDecimal doctorEarning; // Amount doctor earns    @Column(name = "platform_fee", nullable = false, precision = 19, scale = 2)
    private BigDecimal platformFee; // Platform's fee

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private EarningStatus status;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = EarningStatus.PENDING;
        }
    }

    public enum EarningStatus {
        PENDING,
        CONFIRMED,
        WITHDRAWN
    }
}
