package com.capstone.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal_requests")
public class WithdrawalRequest {    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(name = "account_holder_name", nullable = false)
    private String accountHolderName;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private WithdrawalStatus status;

    @Column(name = "transfer_proof_url")
    private String transferProofUrl; // URL to bank transfer screenshot

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy; // Admin who processed the request    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        requestedAt = LocalDateTime.now();
        if (status == null) {
            status = WithdrawalStatus.PENDING;
        }
    }

    // Default constructor
    public WithdrawalRequest() {}    // All args constructor
    public WithdrawalRequest(User doctor, BigDecimal amount, String bankName, String accountNumber,
                           String accountHolderName, String note, WithdrawalStatus status, 
                           String transferProofUrl, String adminNote, User processedBy, 
                           LocalDateTime createdAt, LocalDateTime requestedAt, LocalDateTime approvedAt,
                           LocalDateTime rejectedAt, LocalDateTime cancelledAt, LocalDateTime processedAt) {
        this.doctor = doctor;
        this.amount = amount;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.note = note;
        this.status = status;
        this.transferProofUrl = transferProofUrl;
        this.adminNote = adminNote;
        this.processedBy = processedBy;
        this.createdAt = createdAt;
        this.requestedAt = requestedAt;
        this.approvedAt = approvedAt;
        this.rejectedAt = rejectedAt;
        this.cancelledAt = cancelledAt;
        this.processedAt = processedAt;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getDoctor() { return doctor; }
    public void setDoctor(User doctor) { this.doctor = doctor; }    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public WithdrawalStatus getStatus() { return status; }
    public void setStatus(WithdrawalStatus status) { this.status = status; }

    public String getTransferProofUrl() { return transferProofUrl; }
    public void setTransferProofUrl(String transferProofUrl) { this.transferProofUrl = transferProofUrl; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public User getProcessedBy() { return processedBy; }
    public void setProcessedBy(User processedBy) { this.processedBy = processedBy; }    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }    public static class Builder {
        private User doctor;
        private BigDecimal amount;
        private String bankName;
        private String accountNumber;
        private String accountHolderName;
        private String note;
        private WithdrawalStatus status;
        private String transferProofUrl;
        private String adminNote;
        private User processedBy;
        private LocalDateTime createdAt;
        private LocalDateTime requestedAt;
        private LocalDateTime approvedAt;
        private LocalDateTime rejectedAt;
        private LocalDateTime cancelledAt;
        private LocalDateTime processedAt;        public Builder doctor(User doctor) { this.doctor = doctor; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder bankName(String bankName) { this.bankName = bankName; return this; }
        public Builder accountNumber(String accountNumber) { this.accountNumber = accountNumber; return this; }
        public Builder accountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; return this; }
        public Builder note(String note) { this.note = note; return this; }
        public Builder status(WithdrawalStatus status) { this.status = status; return this; }
        public Builder transferProofUrl(String transferProofUrl) { this.transferProofUrl = transferProofUrl; return this; }
        public Builder adminNote(String adminNote) { this.adminNote = adminNote; return this; }
        public Builder processedBy(User processedBy) { this.processedBy = processedBy; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder requestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; return this; }
        public Builder approvedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; return this; }
        public Builder rejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; return this; }
        public Builder cancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; return this; }
        public Builder processedAt(LocalDateTime processedAt) { this.processedAt = processedAt; return this; }

        public WithdrawalRequest build() {
            return new WithdrawalRequest(doctor, amount, bankName, accountNumber, accountHolderName, 
                                       note, status, transferProofUrl, adminNote, processedBy, 
                                       createdAt, requestedAt, approvedAt, rejectedAt, cancelledAt, processedAt);
        }
    }    public enum WithdrawalStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED,
        COMPLETED
    }
}
