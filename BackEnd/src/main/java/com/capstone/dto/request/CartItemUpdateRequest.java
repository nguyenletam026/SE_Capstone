package com.capstone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemUpdateRequest {

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1. To remove an item, use the delete endpoint or set quantity to 0 via specific logic if implemented.")
    private Integer quantity;
} 