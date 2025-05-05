package com.capstone.service;

import com.capstone.dto.request.ChatPaymentRequest;
import com.capstone.dto.response.ChatPaymentResponse;
import com.capstone.dto.response.PatientChatResponse;
import com.capstone.entity.ChatPayment;
import com.capstone.entity.ChatRequest;
import com.capstone.entity.DoctorSchedule;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.ChatMessageRepository;
import com.capstone.repository.ChatPaymentRepository;
import com.capstone.repository.ChatRequestRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatPaymentService {
    private final ChatPaymentRepository chatPaymentRepository;
    private final ChatRequestRepository chatRequestRepository;
    private final UserRepository userRepository;
    private final SystemConfigService systemConfigService;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DoctorScheduleService doctorScheduleService;
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
        
        // Check if doctor has available schedule slots right now
        Optional<DoctorSchedule> availableSchedule = doctorScheduleService.findAvailableScheduleForDoctor(doctor);
        if (availableSchedule.isEmpty()) {
            log.error("No available schedule slots for doctor {} at current time", doctor.getUsername());
            throw new AppException(ErrorCode.NO_AVAILABLE_SLOTS, 
                    "Bác sĩ hiện không có lịch trống hoặc đã hết slot. Vui lòng thử lại sau.");
        }
        
        DoctorSchedule schedule = availableSchedule.get();
        log.info("Found available schedule slot: {} for doctor {}", schedule.getId(), doctor.getUsername());

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
            // Atomically book the appointment slot before creating the chat request
            boolean slotBooked = doctorScheduleService.bookAppointmentSlot(schedule.getId());
            if (!slotBooked) {
                log.error("Failed to book appointment slot for schedule: {} - slot may have been taken by another user", schedule.getId());
                throw new AppException(ErrorCode.NO_AVAILABLE_SLOTS, 
                        "Slot đã được đặt bởi người khác. Vui lòng thử lại.");
            }
            
            log.info("Successfully booked appointment slot for schedule: {}", schedule.getId());
            
            chatRequest = ChatRequest.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .doctorSchedule(schedule)  // Link to the booked schedule
                    .status(RequestStatus.PENDING)
                    .build();
            chatRequest = chatRequestRepository.save(chatRequest);
            log.info("Created new chat request: {} with schedule: {}", chatRequest.getId(), schedule.getId());
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
            
            // Send notification to doctor
            try {
                Map<String, Object> notification = new HashMap<>();
                notification.put("type", "NEW_CHAT_PAYMENT");
                notification.put("requestId", chatRequest.getId());
                notification.put("patientId", patient.getId());
                notification.put("patientName", patient.getUsername());
                notification.put("patientAvatar", patient.getAvtUrl());
                notification.put("timestamp", LocalDateTime.now().toString());
                notification.put("message", patient.getUsername() + " đã thanh toán phí tư vấn");
                
                log.info("Sending payment notification to doctor: {}", doctor.getUsername());
                messagingTemplate.convertAndSendToUser(
                    doctor.getUsername(),
                    "/queue/notifications",
                    notification
                );
            } catch (Exception e) {
                log.error("Failed to send payment notification: ", e);
                // Don't throw exception here, as payment is already processed
            }
            
            return ChatPaymentResponse.fromEntity(payment);
        } catch (Exception e) {
            // If payment processing fails and we just booked a new slot, release it
            if (existingRequest.isEmpty() && chatRequest != null && chatRequest.getDoctorSchedule() != null) {
                try {
                    boolean released = doctorScheduleService.releaseAppointmentSlot(chatRequest.getDoctorSchedule().getId());
                    log.info("Released appointment slot {} due to payment failure: {}", 
                            chatRequest.getDoctorSchedule().getId(), released);
                } catch (Exception releaseException) {
                    log.error("Failed to release appointment slot during rollback: ", releaseException);
                }
            }
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
            
            // Release the appointment slot if one was booked
            if (chatRequest.getDoctorSchedule() != null) {
                try {
                    boolean released = doctorScheduleService.releaseAppointmentSlot(chatRequest.getDoctorSchedule().getId());
                    log.info("Released appointment slot {} for expired chat request {}: {}", 
                            chatRequest.getDoctorSchedule().getId(), chatRequest.getId(), released);
                } catch (Exception e) {
                    log.error("Failed to release appointment slot for expired chat request {}: ", chatRequest.getId(), e);
                }
            }
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
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        log.info("Found user: {}", currentUser.getUsername());
        
        // Get current time
        LocalDateTime now = LocalDateTime.now();
        
        List<ChatPayment> activePayments;
        
        // Check if user is a doctor or a patient
        if (currentUser.getRole().getName().equals("DOCTOR")) {
            // For doctors, get payments where they are the doctor
            activePayments = chatPaymentRepository.findByDoctorAndExpiresAtGreaterThan(currentUser, now);
            log.info("Found {} active chat payments for doctor", activePayments.size());
        } else {
            // For patients, get payments where they are the patient (original behavior)
            activePayments = chatPaymentRepository.findByPatientAndExpiresAtGreaterThan(currentUser, now);
            log.info("Found {} active chat payments for patient", activePayments.size());
        }
        
        return activePayments.stream()
                .map(ChatPaymentResponse::fromEntity)
                .toList();
    }

    /**
     * Gets all patients with paid and active chat sessions for the current doctor
     * @return List of PatientChatResponse with patient details and chat status
     */
    public List<PatientChatResponse> getPaidChatPatients() {
        log.info("Getting paid chat patients for current doctor");
        
        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User doctor = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        log.info("Found doctor: {}", doctor.getUsername());
        
        // Check if user is a doctor
        if (!doctor.getRole().getName().equals("DOCTOR")) {
            log.error("User {} is not a doctor. Role: {}", doctor.getUsername(), doctor.getRole().getName());
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Get current time
        LocalDateTime now = LocalDateTime.now();
        
        // Find all active payments where current user is the doctor
        List<ChatPayment> activePayments = chatPaymentRepository.findByDoctorAndExpiresAtGreaterThan(doctor, now);
        log.info("Found {} active paid chat sessions for doctor", activePayments.size());
        
        List<PatientChatResponse> patientResponses = new ArrayList<>();
        
        for (ChatPayment payment : activePayments) {
            User patient = payment.getChatRequest().getPatient();
            
            // Get last message between doctor and patient (if any)
            String lastMessage = chatMessageRepository.findLastMessageBetweenUsers(doctor.getId(), patient.getId())
                    .map(message -> message.getContent())
                    .orElse(null);
            
            // Get count of unread messages from this patient
            int unreadCount = chatMessageRepository.countUnreadMessagesFromUser(doctor.getId(), patient.getId());
            
            patientResponses.add(PatientChatResponse.fromChatPayment(payment, lastMessage, unreadCount));
        }
        
        return patientResponses;
    }
} 