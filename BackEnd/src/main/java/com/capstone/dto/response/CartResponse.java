package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private String id; // Cart ID
    private String userId;
    private List<CartItemResponse> items;
    private Double totalAmount;
    // Add other cart-level details if needed, e.g., total items count
} 