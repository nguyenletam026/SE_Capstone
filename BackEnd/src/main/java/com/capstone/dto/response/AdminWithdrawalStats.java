package com.capstone.dto.response;

import java.math.BigDecimal;

public class AdminWithdrawalStats {
    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private BigDecimal totalApprovedAmount;
    private BigDecimal totalPendingAmount;

    // Default constructor
    public AdminWithdrawalStats() {}

    // All args constructor
    public AdminWithdrawalStats(long totalRequests, long pendingRequests, long approvedRequests, 
                               long rejectedRequests, BigDecimal totalApprovedAmount, BigDecimal totalPendingAmount) {
        this.totalRequests = totalRequests;
        this.pendingRequests = pendingRequests;
        this.approvedRequests = approvedRequests;
        this.rejectedRequests = rejectedRequests;
        this.totalApprovedAmount = totalApprovedAmount;
        this.totalPendingAmount = totalPendingAmount;
    }

    // Getters and setters
    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getApprovedRequests() {
        return approvedRequests;
    }

    public void setApprovedRequests(long approvedRequests) {
        this.approvedRequests = approvedRequests;
    }

    public long getRejectedRequests() {
        return rejectedRequests;
    }

    public void setRejectedRequests(long rejectedRequests) {
        this.rejectedRequests = rejectedRequests;
    }

    public BigDecimal getTotalApprovedAmount() {
        return totalApprovedAmount;
    }

    public void setTotalApprovedAmount(BigDecimal totalApprovedAmount) {
        this.totalApprovedAmount = totalApprovedAmount;
    }

    public BigDecimal getTotalPendingAmount() {
        return totalPendingAmount;
    }

    public void setTotalPendingAmount(BigDecimal totalPendingAmount) {
        this.totalPendingAmount = totalPendingAmount;
    }
}
