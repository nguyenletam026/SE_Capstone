package com.capstone.service;

import com.capstone.dto.request.ChatPaymentRequest;
import com.capstone.dto.response.ChatPaymentResponse;
import com.capstone.entity.ChatPayment;
import com.capstone.entity.ChatRequest;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.ChatPaymentRepository;
import com.capstone.repository.ChatRequestRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatPaymentService {
    private final ChatPaymentRepository chatPaymentRepository;
    private final ChatRequestRepository chatRequestRepository;
    private final UserRepository userRepository;
    private final SystemConfigService systemConfigService;
    
    @Transactional
    public ChatPaymentResponse createChatPayment(ChatPaymentRequest request) {
        log.info("Starting chat payment creation with request: {}", request);
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Authenticated username: {}", username);
        
        User patient = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        log.info("Found patient: {}", patient.getUsername());
        
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        log.info("Found doctor: {}", doctor.getUsername());
        
        if (!doctor.getRole().getName().equals("DOCTOR")) {
            log.error("User {} is not a doctor. Role: {}", doctor.getUsername(), doctor.getRole().getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Check for existing chat request or create new one
        ChatRequest chatRequest;
        Optional<ChatRequest> existingRequest = chatRequestRepository
                .findByPatientAndDoctorAndStatus(patient, doctor, RequestStatus.PENDING);
        
        if (existingRequest.isPresent()) {
            chatRequest = existingRequest.get();
            log.info("Found existing chat request: {}", chatRequest.getId());
            
            // Check if there's already a payment for this chat request
            Optional<ChatPayment> existingPayment = chatPaymentRepository.findByChatRequest(chatRequest);
            if (existingPayment.isPresent()) {
                log.error("Payment already exists for chat request: {}", chatRequest.getId());
                throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Đã tồn tại thanh toán cho yêu cầu tư vấn này");
            }
        } else {
            chatRequest = ChatRequest.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .status(RequestStatus.PENDING)
                    .build();
            chatRequest = chatRequestRepository.save(chatRequest);
            log.info("Created new chat request: {}", chatRequest.getId());
        }
        
        // Get the current cost per hour from system config
        double costPerHour = systemConfigService.getChatCostPerHour();
        log.info("Current chat cost per hour: {} VND", costPerHour);
        
        // Calculate payment amount
        double amount = request.getHours() * costPerHour;
        
        // Check user's balance
        if (patient.getBalance() < amount) {
            log.error("Insufficient balance for user {}: has {} VND, needs {} VND", 
                    patient.getUsername(), patient.getBalance(), amount);
            throw new AppException(ErrorCode.PAYMENT_REQUIRED, 
                    String.format("Số dư không đủ. Cần %,.0f VND để tư vấn %d giờ.", amount, request.getHours()));
        }
        
        // Calculate expiration time
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(request.getHours());
        
        // Create payment record
        ChatPayment payment = ChatPayment.builder()
                .chatRequest(chatRequest)
                .amount(amount)
                .hours(request.getHours())
                .expiresAt(expiresAt)
                .build();
        
        try {
            // Deduct amount from user's balance
            patient.setBalance(patient.getBalance() - amount);
            userRepository.save(patient);
            log.info("Deducted {} VND from user {}'s balance", amount, patient.getUsername());
            
            // Update chat request status to APPROVED
            chatRequest.setStatus(RequestStatus.APPROVED);
            chatRequestRepository.save(chatRequest);
            log.info("Updated chat request status to APPROVED: {}", chatRequest.getId());
            
            payment = chatPaymentRepository.save(payment);
            log.info("Successfully created chat payment: {}", payment.getId());
            return ChatPaymentResponse.fromEntity(payment);
        } catch (Exception e) {
            log.error("Error processing chat payment: ", e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể xử lý thanh toán. Vui lòng thử lại sau.");
        }
    }
    
    public ChatPaymentResponse getChatPaymentByRequestId(String requestId) {
        ChatPayment payment = chatPaymentRepository.findByChatRequestId(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        
        return ChatPaymentResponse.fromEntity(payment);
    }
    
    public boolean isChatActive(ChatRequest chatRequest) {
        // Get current time
        LocalDateTime now = LocalDateTime.now();
        
        // Check if there's an active payment for this chat request
        boolean isActive = chatPaymentRepository.existsByChatRequestAndExpiresAtGreaterThan(chatRequest, now);
        
        if (!isActive) {
            // If not active, update chat request status to indicate expiration
            chatRequest.setStatus(RequestStatus.PAYMENT_REQUIRED);
            chatRequestRepository.save(chatRequest);
            log.info("Chat request {} marked as PAYMENT_REQUIRED due to expiration", chatRequest.getId());
        }
        
        return isActive;
    }
    
    public Optional<LocalDateTime> getChatExpiryTime(ChatRequest chatRequest) {
        return chatPaymentRepository.findByChatRequest(chatRequest)
                .map(ChatPayment::getExpiresAt);
    }

    public List<ChatPaymentResponse> getActiveChatPayments() {
        log.info("Getting active chat payments for current user");
        
        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User patient = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        log.info("Found patient: {}", patient.getUsername());
        
        // Get current time
        LocalDateTime now = LocalDateTime.now();
        
        // Find all active chat payments for the user
        List<ChatPayment> activePayments = chatPaymentRepository.findByPatientAndExpiresAtGreaterThan(patient, now);
        log.info("Found {} active chat payments", activePayments.size());
        
        return activePayments.stream()
                .map(ChatPaymentResponse::fromEntity)
                .toList();
    }
} 