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
    private String doctorName;
    private double amount;
    private int hours;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private boolean active;
    
    public static ChatPaymentResponse fromEntity(ChatPayment payment) {
        return ChatPaymentResponse.builder()
                .id(payment.getId())
                .requestId(payment.getChatRequest().getId())
                .patientId(payment.getChatRequest().getPatient().getId())
                .patientName(payment.getChatRequest().getPatient().getUsername())
                .doctorId(payment.getChatRequest().getDoctor().getId())
                .doctorName(payment.getChatRequest().getDoctor().getUsername())
                .amount(payment.getAmount())
                .hours(payment.getHours())
                .expiresAt(payment.getExpiresAt())
                .createdAt(payment.getCreatedAt())
                .active(payment.getExpiresAt().isAfter(LocalDateTime.now()))
                .build();
    }
} 