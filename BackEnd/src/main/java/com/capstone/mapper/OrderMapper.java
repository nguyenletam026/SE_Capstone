package com.capstone.mapper;

import com.capstone.dto.response.OrderItemResponse;
import com.capstone.dto.response.OrderResponse;
import com.capstone.entity.OrderItem;
import com.capstone.entity.ProductOrder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProduct().getName())
                .productImageUrl(orderItem.getProduct().getImageUrl())
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .subtotal(orderItem.getPrice() * orderItem.getQuantity())
                .build();
    }

    public OrderResponse toOrderResponse(ProductOrder order) {
        List<OrderItemResponse> items = order.getOrderItems() == null ? 
            new ArrayList<>() : 
            order.getOrderItems().stream()
                .map(this::toOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .items(items)
                .build();
    }

    public List<OrderResponse> toOrderResponseList(List<ProductOrder> orders) {
        return orders.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }
} 