package com.capstone.dto.response;

import com.capstone.entity.ChatPayment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatPaymentResponse {
    private String id;
    private String requestId;
    private String patientId;
    private String patientName;
    private String doctorId;
    private String doctorName;    private double amount;
    private int hours;
    private Integer minutes; // Minutes purchased (nullable for backward compatibility)
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private boolean active;
    
    // Refund related fields
    private boolean refunded;
    private Double refundAmount;
    private String refundReason;
    private LocalDateTime refundedAt;
    
    public static ChatPaymentResponse fromEntity(ChatPayment payment) {
        return ChatPaymentResponse.builder()
                .id(payment.getId())
                .requestId(payment.getChatRequest().getId())
                .patientId(payment.getChatRequest().getPatient().getId())
                .patientName(payment.getChatRequest().getPatient().getUsername())
                .doctorId(payment.getChatRequest().getDoctor().getId())
                .doctorName(payment.getChatRequest().getDoctor().getUsername())                .amount(payment.getAmount())
                .hours(payment.getHours())
                .minutes(payment.getMinutes())
                .expiresAt(payment.getExpiresAt())
                .createdAt(payment.getCreatedAt())
                .active(payment.getExpiresAt().isAfter(LocalDateTime.now()))
                .build();
    }
} 