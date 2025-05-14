package com.capstone.service;

import com.capstone.dto.request.ProductPurchaseRequest;
import com.capstone.dto.response.OrderResponse;
import com.capstone.entity.OrderItem;
import com.capstone.entity.Product;
import com.capstone.entity.ProductOrder;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.mapper.OrderMapper;
import com.capstone.repository.OrderItemRepository;
import com.capstone.repository.ProductOrderRepository;
import com.capstone.repository.ProductRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductOrderService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductOrderRepository productOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;
    private final ProductService productService;

    @Transactional
    public OrderResponse purchaseProduct(List<ProductPurchaseRequest> requests) {
        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Calculate total amount and validate product availability
        double totalAmount = 0;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (ProductPurchaseRequest request : requests) {
            Product product = productService.findProductById(request.getProductId());
            
            // Check if product has enough stock
            if (product.getStock() < request.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            
            // Calculate item price
            double itemPrice = product.getPrice() * request.getQuantity();
            totalAmount += itemPrice;
            
            // Create order item (will be saved later with cascade)
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();
            
            orderItems.add(orderItem);
        }
        
        // Check if user has enough balance
        if (user.getBalance() < totalAmount) {
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
        }
        
        // Create and save order
        ProductOrder order = ProductOrder.builder()
                .user(user)
                .totalAmount(totalAmount)
                .orderItems(new ArrayList<>()) // Initialize with empty list
                .build();
        
        // Save order first to get ID
        ProductOrder savedOrder = productOrderRepository.save(order);
        
        // Set order reference in order items and update product stock
        for (int i = 0; i < orderItems.size(); i++) {
            OrderItem orderItem = orderItems.get(i);
            Product product = orderItem.getProduct();
            
            // Update product stock
            product.setStock(product.getStock() - orderItem.getQuantity());
            productRepository.save(product);
            
            // Set order reference and save order item
            orderItem.setOrder(savedOrder);
        }
        
        // Save all order items
        orderItemRepository.saveAll(orderItems);
        
        // Update user balance
        user.setBalance(user.getBalance() - totalAmount);
        userRepository.save(user);
        
        // Return order response
        return orderMapper.toOrderResponse(savedOrder);
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders() {
        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Get user orders
        List<ProductOrder> orders = productOrderRepository.findByUserOrderByOrderDateDesc(user);
        
        // Map to response
        return orderMapper.toOrderResponseList(orders);
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId) {
        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Find order
        ProductOrder order = productOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        
        // Check if order belongs to user or user is admin
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().getName().equals("ADMIN")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Map to response
        return orderMapper.toOrderResponse(order);
    }
} 