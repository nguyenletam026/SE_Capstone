package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private String id; // CartItem ID
    private String productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private Double price; // Price of one unit of the product
    private Double subtotal; // quantity * price
    private Integer stock; // Available stock for the product
}