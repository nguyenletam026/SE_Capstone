package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private String userId;
    private String userName;
    private Double totalAmount;
    private Date orderDate;
    private List<OrderItemResponse> items;
    private String address;
    private String phoneNumber;
    private String paymentMethod;
    private String status;
} 