package com.capstone.controller;

import com.capstone.dto.request.CartItemAddRequest;
import com.capstone.dto.request.CartItemUpdateRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.CartResponse;
import com.capstone.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "APIs for managing user shopping cart")
@PreAuthorize("hasRole(\'USER\') or hasRole(\'ADMIN\')") // Assuming cart operations are for authenticated users
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ApiResponse<CartResponse> addItemToCart(@RequestBody @Valid CartItemAddRequest request) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.addItemToCart(request.getProductId(), request.getQuantity()))
                .build();
    }

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ApiResponse<CartResponse> getCart() {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.getCart())
                .build();
    }

    @PutMapping("/items/{cartItemId}")
    @Operation(summary = "Update item quantity in cart")
    public ApiResponse<CartResponse> updateCartItem(
            @PathVariable String cartItemId,
            @RequestBody @Valid CartItemUpdateRequest request) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.updateCartItem(cartItemId, request.getQuantity()))
                .build();
    }

    @DeleteMapping("/items/{cartItemId}")
    @Operation(summary = "Remove item from cart")
    public ApiResponse<CartResponse> removeCartItem(@PathVariable String cartItemId) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.removeCartItem(cartItemId))
                .build();
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from cart")
    public ApiResponse<String> clearCart() {
        cartService.clearCart();
        return ApiResponse.<String>builder()
                .result("Cart cleared successfully.")
                .build();
    }
} 