package com.capstone.controller;

import com.capstone.dto.request.OrderCreateRequest;
import com.capstone.dto.request.OrderStatusUpdateRequest;
import com.capstone.dto.request.ProductPurchaseRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.OrderResponse;
import com.capstone.service.ProductOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Product Orders", description = "APIs for managing product orders")
public class OrderController {
    private final ProductOrderService productOrderService;

    @PostMapping("/create-from-cart")
    @Operation(summary = "Create an order from the current user's shopping cart")
    @PreAuthorize("hasRole(\'USER\') or hasRole(\'ADMIN\')")
    public ApiResponse<OrderResponse> createOrderFromCart(
            @RequestBody @Valid OrderCreateRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(productOrderService.createOrderFromCurrentUserCart(
                        request.getAddress(), 
                        request.getPhoneNumber(), 
                        request.getPaymentMethod()))
                .build();
    }

    @GetMapping
    @Operation(summary = "Get current user's orders")
    @PreAuthorize("hasRole(\'USER\') or hasRole(\'ADMIN\')")
    public ApiResponse<List<OrderResponse>> getUserOrders() {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(productOrderService.getUserOrders())
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by ID (User sees own, Admin sees any)")
    @PreAuthorize("hasRole(\'USER\') or hasRole(\'ADMIN\')")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable String id) {
        return ApiResponse.<OrderResponse>builder()
                .result(productOrderService.getOrderById(id))
                .build();
    }

    @GetMapping("/admin/all")
    @Operation(summary = "[ADMIN] Get all orders")
    @PreAuthorize("hasRole(\'ADMIN\')")
    public ApiResponse<List<OrderResponse>> getAllOrdersForAdmin() {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(productOrderService.getAllOrdersForAdmin())
                .build();
    }

    @PutMapping("/admin/{orderId}/status")
    @Operation(summary = "[ADMIN] Update order status")
    @PreAuthorize("hasRole(\'ADMIN\')")
    public ApiResponse<OrderResponse> updateOrderStatusForAdmin(
            @PathVariable String orderId,
            @RequestBody @Valid OrderStatusUpdateRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(productOrderService.updateOrderStatusForAdmin(orderId, request.getStatus()))
                .build();
    }
} 