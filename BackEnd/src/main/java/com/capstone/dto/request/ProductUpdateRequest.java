package com.capstone.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    private String name;
    private String description;
    
    @Min(value = 0, message = "Price must be positive")
    private Double price;
    
    @Min(value = 0, message = "Stock must be positive")
    private Integer stock;
} 