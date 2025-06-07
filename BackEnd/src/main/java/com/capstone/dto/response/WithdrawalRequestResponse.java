package com.capstone.dto.response;

import com.capstone.entity.WithdrawalRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalRequestResponse {
    
    private String id;
    private String doctorId;
    private String doctorName;
    private Double amount;
    private String bankName;
    private String accountNumber;
    private String accountHolderName;
    private String note;
    private WithdrawalRequest.WithdrawalStatus status;    private String transferProofUrl;
    private String adminNote;
    
    // Doctor additional information
    private String doctorPhone;
    private String doctorEmail;
    private String doctorSpecialty;
    private LocalDateTime createdAt;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime processedAt;
}
