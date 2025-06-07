package com.capstone.dto.response;

import com.capstone.entity.ChatMessage;
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
public class ChatHistoryResponse {
    private String doctorId;
    private String doctorName;
    private String doctorAvatar;
    private String doctorSpecialty;
    private Double doctorRating;
    private String requestId;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isActive;
    private boolean isExpired;
    private int unreadCount;
    private int totalMessages;
      public static ChatHistoryResponse fromChatData(User doctor, ChatMessage lastMessage, 
                                                   ChatPayment payment, int unreadCount, int totalMessages, String specialization) {
        LocalDateTime expiresAt = payment != null ? payment.getExpiresAt() : null;
        boolean isActive = payment != null && expiresAt != null && expiresAt.isAfter(LocalDateTime.now());
        
        return ChatHistoryResponse.builder()
                .doctorId(doctor.getId())
                .doctorName(doctor.getFirstName() + " " + doctor.getLastName())
                .doctorAvatar(doctor.getAvtUrl())
                .doctorSpecialty(specialization != null ? specialization : "Bác sĩ tư vấn")
                .doctorRating(4.5) // Default rating, can be updated if rating system exists
                .requestId(payment != null ? payment.getChatRequest().getId() : null)
                .lastMessage(lastMessage != null ? lastMessage.getContent() : null)
                .lastMessageTime(lastMessage != null ? lastMessage.getTimestamp() : null)
                .createdAt(payment != null ? payment.getCreatedAt() : null)
                .expiresAt(expiresAt)
                .isActive(isActive)
                .isExpired(!isActive && expiresAt != null)
                .unreadCount(unreadCount)
                .totalMessages(totalMessages)
                .build();
    }
}
