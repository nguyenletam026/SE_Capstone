package com.capstone.dto.response;

import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestResponse {
    private String requestId;
    private String patientId;
    private String patientName;
    private String patientAvatar;
    private RequestStatus status;
    private String createdAt;

    public static ChatRequestResponse fromChatRequest(com.capstone.entity.ChatRequest request) {
        User patient = request.getPatient();
        return ChatRequestResponse.builder()
                .requestId(request.getId())
                .patientId(patient.getId())
                .patientName(patient.getUsername())
                .patientAvatar(patient.getAvtUrl())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt().toString())
                .build();
    }
} 