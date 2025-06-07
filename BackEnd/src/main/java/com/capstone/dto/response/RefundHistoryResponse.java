package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for refund history
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundHistoryResponse {
    private String paymentId;
    private String chatRequestId;
    private String doctorName;
    private String patientName;
    private double originalAmount;
    private double refundAmount;
    private String refundReason;
    private LocalDateTime paymentDate;
    private LocalDateTime refundDate;
    private int hoursPurchased;
    private String refundPercentage;
    
    // User role context (to determine if this is viewed as patient or doctor)
    private String viewerRole;
}
