package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private String id;
    private String productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private Double price;
    private Double subtotal;
} 