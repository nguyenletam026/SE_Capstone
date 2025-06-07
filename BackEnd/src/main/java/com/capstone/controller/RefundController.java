package com.capstone.controller;

import com.capstone.dto.ApiResponse;
import com.capstone.dto.response.RefundHistoryResponse;
import com.capstone.entity.ChatPayment;
import com.capstone.entity.User;
import com.capstone.repository.UserRepository;
import com.capstone.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing refunds
 */
@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
@Slf4j
public class RefundController {    private final RefundService refundService;
    private final UserRepository userRepository;/**
     * Get refund history for the current user (patient or doctor)
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_DOCTOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getRefundHistory(Authentication authentication) {
        try {
            User currentUser = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<RefundHistoryResponse> refundHistory = refundService.getRefundHistory(currentUser);
            
            return ResponseEntity.ok(ApiResponse.success(refundHistory));
        } catch (Exception e) {
            log.error("Error retrieving refund history for user: {}", authentication.getName(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve refund history: " + e.getMessage()));
        }
    }

    /**
     * Manually process refund for a specific payment (Admin only)
     */
    @PostMapping("/{paymentId}/process")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> processManualRefund(
            @PathVariable String paymentId,
            @RequestParam(required = false, defaultValue = "Manual processing by admin") String reason) {
        try {
            boolean success = refundService.processManualRefund(paymentId, reason);
            
            if (success) {
                return ResponseEntity.ok(ApiResponse.success("Payment " + paymentId + " has been refunded successfully"));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Failed to process refund - payment may already be refunded or not eligible"));
            }
        } catch (Exception e) {
            log.error("Error processing manual refund for payment: {}", paymentId, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to process refund: " + e.getMessage()));
        }
    }

    /**
     * Get refund statistics (Admin only)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getRefundStatistics() {
        try {
            Object statistics = refundService.generateRefundStatistics();
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            log.error("Error retrieving refund statistics", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve refund statistics: " + e.getMessage()));
        }
    }

    /**
     * Get all payments eligible for refund (Admin only)
     */
    @GetMapping("/eligible")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getPaymentsEligibleForRefund() {
        try {
            List<ChatPayment> eligiblePayments = refundService.getPaymentsEligibleForRefund();
            return ResponseEntity.ok(ApiResponse.success(eligiblePayments));
        } catch (Exception e) {
            log.error("Error retrieving eligible payments for refund", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve eligible payments: " + e.getMessage()));
        }
    }    /**
     * Request manual refund (Patient only)
     * This allows patients to request a refund if they believe they deserve one
     */
    @PostMapping("/request/{paymentId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponse> requestRefund(
            @PathVariable String paymentId,
            @RequestParam String reason,
            Authentication authentication) {
        try {
            User patient = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            boolean success = refundService.requestRefund(paymentId, patient, reason);
            
            if (success) {
                return ResponseEntity.ok(ApiResponse.success("Your refund request has been submitted for review"));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Failed to submit refund request - payment may not be eligible or already processed"));
            }
        } catch (Exception e) {            log.error("Error processing refund request for payment: {} by user: {}", paymentId, authentication.getName(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to submit refund request: " + e.getMessage()));
        }
    }

    /**
     * Get refund warnings for doctors
     */
    @GetMapping("/doctor/warnings")
    @PreAuthorize("hasRole('ROLE_DOCTOR')")
    public ResponseEntity<ApiResponse> getDoctorRefundWarnings(Authentication authentication) {
        try {
            User doctor = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Object warnings = refundService.getDoctorRefundWarnings(doctor);
            
            return ResponseEntity.ok(ApiResponse.success(warnings));
        } catch (Exception e) {
            log.error("Error retrieving doctor refund warnings for user: {}", authentication.getName(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve refund warnings: " + e.getMessage()));
        }
    }

    /**
     * Get doctor response statistics  
     */
    @GetMapping("/doctor/response-stats")
    @PreAuthorize("hasRole('ROLE_DOCTOR')")
    public ResponseEntity<ApiResponse> getDoctorResponseStats(Authentication authentication) {
        try {
            User doctor = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Object stats = refundService.getDoctorResponseStats(doctor);
            
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error retrieving doctor response statistics for user: {}", authentication.getName(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to retrieve response statistics: " + e.getMessage()));
        }
    }
}
