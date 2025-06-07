package com.capstone.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatPaymentRequest {
    @NotNull(message = "Doctor ID is required")
    private String doctorId;
    
    @Min(value = 1, message = "Hours must be at least 1")
    private int hours;
    
    @Min(value = 1, message = "Minutes must be at least 1")
    private Integer minutes; // Optional: for minute-based payments
}