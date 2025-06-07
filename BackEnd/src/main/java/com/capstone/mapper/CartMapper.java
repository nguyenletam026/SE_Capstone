package com.capstone.mapper;

import com.capstone.dto.response.CartItemResponse;
import com.capstone.dto.response.CartResponse;
import com.capstone.entity.Cart;
import com.capstone.entity.CartItem;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartItemResponse toCartItemResponse(CartItem cartItem) {
        if (cartItem == null || cartItem.getProduct() == null) return null;
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImageUrl(cartItem.getProduct().getImageUrl())
                .quantity(cartItem.getQuantity())
                .price(cartItem.getProduct().getPrice()) // Assuming price is stored on product entity
                .subtotal(cartItem.getProduct().getPrice() * cartItem.getQuantity())
                .stock(cartItem.getProduct().getStock()) // Add stock information
                .build();
    }

    public CartResponse toCartResponse(Cart cart) {
        if (cart == null) return null;

        List<CartItemResponse> itemResponses = cart.getItems() == null ? 
            Collections.emptyList() :
            cart.getItems().stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());

        double totalAmount = itemResponses.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemResponses)
                .totalAmount(totalAmount)
                .build();
    }
}