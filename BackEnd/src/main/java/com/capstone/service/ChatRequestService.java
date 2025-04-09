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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRequestService {
    private final ChatRequestRepository chatRequestRepository;
    private final UserRepository userRepository;

    public ChatRequest createChatRequest(String doctorId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User patient = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!doctor.getRole().getName().equals("DOCTOR")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (chatRequestRepository.existsByPatientAndDoctorAndStatus(patient, doctor, RequestStatus.PENDING)) {
            throw new AppException(ErrorCode.REQUEST_ALREADY_PROCESSED);
        }

        ChatRequest chatRequest = ChatRequest.builder()
                .patient(patient)
                .doctor(doctor)
                .status(RequestStatus.PENDING)
                .build();

        return chatRequestRepository.save(chatRequest);
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
} 