package com.capstone.enums;

public enum RequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    PAYMENT_REQUIRED;

    @Override
    public String toString() {
        return this.name();
    }
}
