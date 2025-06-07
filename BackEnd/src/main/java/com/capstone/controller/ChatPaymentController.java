package com.capstone.controller;

import com.capstone.dto.request.ChatPaymentRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.ChatPaymentResponse;
import com.capstone.dto.response.PatientChatResponse;
import com.capstone.service.ChatPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-payments")
@RequiredArgsConstructor
@Slf4j
public class ChatPaymentController {
    private final ChatPaymentService chatPaymentService;
    
    @PostMapping
    public ApiResponse<ChatPaymentResponse> createChatPayment(@Valid @RequestBody ChatPaymentRequest request) {
        log.info("Received chat payment request: {}", request);
        try {
            ChatPaymentResponse response = chatPaymentService.createChatPayment(request);
            log.info("Successfully created chat payment with ID: {}", response.getId());
            return ApiResponse.<ChatPaymentResponse>builder()
                    .result(response)
                    .build();
        } catch (Exception e) {
            log.error("Error creating chat payment: ", e);
            throw e;
        }
    }
    
    @GetMapping("/request/{requestId}")
    public ApiResponse<ChatPaymentResponse> getChatPaymentByRequestId(@PathVariable String requestId) {
        return ApiResponse.<ChatPaymentResponse>builder()
                .result(chatPaymentService.getChatPaymentByRequestId(requestId))
                .build();
    }

    @GetMapping("/active")
    public ApiResponse<List<ChatPaymentResponse>> getActiveChatPayments() {
        log.info("Fetching active chat payments for current user");
        return ApiResponse.<List<ChatPaymentResponse>>builder()
                .result(chatPaymentService.getActiveChatPayments())
                .build();
    }
    
    @GetMapping("/paid-chats")
    public ApiResponse<List<PatientChatResponse>> getPaidChatPatients() {
        log.info("Fetching paid chat patients for current doctor");
        return ApiResponse.<List<PatientChatResponse>>builder()
                .result(chatPaymentService.getPaidChatPatients())
                .build();
    }
    
    /**
     * Get refund history for current user (patient or doctor)
     */
    @GetMapping("/refund-history")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_ADMIN')")
    public ApiResponse<List<ChatPaymentResponse>> getRefundHistory() {
        log.info("Fetching refund history for current user");
        return ApiResponse.<List<ChatPaymentResponse>>builder()
                .result(chatPaymentService.getRefundHistory())
                .build();
    }
      /**
     * Get all refund history for admin users
     */
    @GetMapping("/refund-history/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<List<ChatPaymentResponse>> getAllRefundHistory() {
        log.info("Fetching all refund history for admin");
        return ApiResponse.<List<ChatPaymentResponse>>builder()
                .result(chatPaymentService.getAllRefundHistory())
                .build();
    }
    
    /**
     * Get all consultations for admin users
     */
    @GetMapping("/admin/all-consultations")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<List<ChatPaymentResponse>> getAllConsultations() {
        log.info("Fetching all consultations for admin");
        return ApiResponse.<List<ChatPaymentResponse>>builder()
                .result(chatPaymentService.getAllConsultations())
                .build();
    }
}