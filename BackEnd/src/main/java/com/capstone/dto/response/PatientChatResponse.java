package com.capstone.dto.response;

import com.capstone.entity.ChatPayment;
import com.capstone.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientChatResponse {
    private String patientId;
    private String patientName;
    private String patientAvatar;
    private String requestId;
    private LocalDateTime expiresAt;
    private String lastMessage;
    private int unreadCount;
    
    public static PatientChatResponse fromChatPayment(ChatPayment payment, String lastMessage, int unreadCount) {
        User patient = payment.getChatRequest().getPatient();
        
        return PatientChatResponse.builder()
                .patientId(patient.getId())
                .patientName(patient.getUsername())
                .patientAvatar(patient.getAvtUrl())
                .requestId(payment.getChatRequest().getId())
                .expiresAt(payment.getExpiresAt())
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .build();
    }
} 