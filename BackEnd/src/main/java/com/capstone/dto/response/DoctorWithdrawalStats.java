package com.capstone.dto.response;

import java.math.BigDecimal;

public class DoctorWithdrawalStats {
    private BigDecimal totalRequested;
    private BigDecimal totalApproved;
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;

    // Default constructor
    public DoctorWithdrawalStats() {}

    // All args constructor
    public DoctorWithdrawalStats(BigDecimal totalRequested, BigDecimal totalApproved, 
                                long pendingCount, long approvedCount, long rejectedCount) {
        this.totalRequested = totalRequested;
        this.totalApproved = totalApproved;
        this.pendingCount = pendingCount;
        this.approvedCount = approvedCount;
        this.rejectedCount = rejectedCount;
    }

    // Getters and setters
    public BigDecimal getTotalRequested() {
        return totalRequested;
    }

    public void setTotalRequested(BigDecimal totalRequested) {
        this.totalRequested = totalRequested;
    }

    public BigDecimal getTotalApproved() {
        return totalApproved;
    }

    public void setTotalApproved(BigDecimal totalApproved) {
        this.totalApproved = totalApproved;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getApprovedCount() {
        return approvedCount;
    }

    public void setApprovedCount(long approvedCount) {
        this.approvedCount = approvedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
}
