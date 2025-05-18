package com.capstone.service;

import com.capstone.dto.response.ChatRequestResponse;
import com.capstone.entity.ChatRequest;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.ChatRequestRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRequestService {
    private final ChatRequestRepository chatRequestRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatRequest createChatRequest(String doctorId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User patient = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!doctor.getRole().getName().equals("DOCTOR")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Check if there's already an approved request
        Optional<ChatRequest> existingApproved = chatRequestRepository.findByPatientAndDoctorAndStatus(
            patient, doctor, RequestStatus.APPROVED);
        
        if (existingApproved.isPresent()) {
            // If there's already an approved request, just return it
            log.info("Found existing approved chat request between patient {} and doctor {}", 
                    patient.getUsername(), doctor.getUsername());
            return existingApproved.get();
        }
        
        // Check if there's a pending request
        Optional<ChatRequest> existingPending = chatRequestRepository.findByPatientAndDoctorAndStatus(
            patient, doctor, RequestStatus.PENDING);
            
        if (existingPending.isPresent()) {
            // Update the pending request to approved
            ChatRequest pendingRequest = existingPending.get();
            pendingRequest.setStatus(RequestStatus.APPROVED);
            ChatRequest savedRequest = chatRequestRepository.save(pendingRequest);
            
            log.info("Updated existing pending request to approved for patient {} and doctor {}", 
                    patient.getUsername(), doctor.getUsername());
            
            sendNotificationToDoctor(doctor, patient, savedRequest);
            return savedRequest;
        }

        // Create a new request if none exists
        ChatRequest chatRequest = ChatRequest.builder()
                .patient(patient)
                .doctor(doctor)
                .status(RequestStatus.APPROVED)
                .build();

        ChatRequest savedRequest = chatRequestRepository.save(chatRequest);
        
        sendNotificationToDoctor(doctor, patient, savedRequest);
        
        return savedRequest;
    }
    
    private void sendNotificationToDoctor(User doctor, User patient, ChatRequest chatRequest) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "NEW_CHAT_REQUEST");
            notification.put("requestId", chatRequest.getId());
            notification.put("patientId", patient.getId());
            notification.put("patientName", patient.getUsername());
            notification.put("patientAvatar", patient.getAvtUrl());
            notification.put("timestamp", chatRequest.getCreatedAt().toString());
            notification.put("message", patient.getUsername() + " muốn trò chuyện với bạn");
            
            messagingTemplate.convertAndSendToUser(
                doctor.getUsername(),
                "/queue/notifications",
                notification
            );
            
            log.info("Sent chat notification to doctor: {}", doctor.getUsername());
        } catch (Exception e) {
            log.error("Failed to send notification to doctor: {}", e.getMessage());
        }
    }

    public ChatRequest acceptChatRequest(String requestId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ChatRequest chatRequest = chatRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        if (!chatRequest.getDoctor().getId().equals(doctor.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        chatRequest.setStatus(RequestStatus.APPROVED);
        return chatRequestRepository.save(chatRequest);
    }

    public ChatRequest rejectChatRequest(String requestId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ChatRequest chatRequest = chatRequestRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        if (!chatRequest.getDoctor().getId().equals(doctor.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        chatRequest.setStatus(RequestStatus.REJECTED);
        return chatRequestRepository.save(chatRequest);
    }

    public List<ChatRequestResponse> getPendingRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return chatRequestRepository.findByDoctorAndStatus(doctor, RequestStatus.PENDING)
                .stream()
                .map(ChatRequestResponse::fromChatRequest)
                .collect(Collectors.toList());
    }

    public List<ChatRequestResponse> getMyRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User patient = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return chatRequestRepository.findByPatientAndStatus(patient, RequestStatus.PENDING)
                .stream()
                .map(ChatRequestResponse::fromChatRequest)
                .collect(Collectors.toList());
    }

    public List<ChatRequestResponse> getAcceptedRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return chatRequestRepository.findByDoctorAndStatus(doctor, RequestStatus.APPROVED)
                .stream()
                .map(ChatRequestResponse::fromChatRequest)
                .collect(Collectors.toList());
    }

    public List<ChatRequestResponse> getUserAcceptedRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User patient = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return chatRequestRepository.findByPatientAndStatus(patient, RequestStatus.APPROVED)
                .stream()
                .map(ChatRequestResponse::fromChatRequest)
                .collect(Collectors.toList());
    }
} 