package com.capstone.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatPayment {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;

    @OneToOne
    @JoinColumn(name = "chat_request_id", nullable = false)
    private ChatRequest chatRequest;

    @Column(nullable = false)
    private double amount; // Amount in Vietnamese Dong (VND)    @Column(nullable = false)
    private int hours; // Number of hours purchased

    @Column(nullable = true)
    private Integer minutes; // Number of minutes purchased (nullable for backward compatibility)

    @Column(nullable = false)
    private LocalDateTime expiresAt; // When the chat time expires

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Refund related fields
    @Column(nullable = false)
    @Builder.Default
    private boolean refunded = false;

    private Double refundAmount;

    private String refundReason;

    private LocalDateTime refundedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 