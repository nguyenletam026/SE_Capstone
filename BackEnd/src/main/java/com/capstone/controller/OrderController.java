package com.capstone.controller;

import com.capstone.dto.request.ProductPurchaseRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.OrderResponse;
import com.capstone.service.ProductOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Product Orders", description = "APIs for managing product orders")
public class OrderController {
    private final ProductOrderService productOrderService;

    @PostMapping("/purchase")
    @Operation(summary = "Purchase health products")
    public ApiResponse<OrderResponse> purchaseProducts(
            @RequestBody @Valid List<ProductPurchaseRequest> requests) {
        return ApiResponse.<OrderResponse>builder()
                .result(productOrderService.purchaseProduct(requests))
                .build();
    }

    @GetMapping
    @Operation(summary = "Get current user's orders")
    public ApiResponse<List<OrderResponse>> getUserOrders() {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(productOrderService.getUserOrders())
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable String id) {
        return ApiResponse.<OrderResponse>builder()
                .result(productOrderService.getOrderById(id))
                .build();
    }
} 