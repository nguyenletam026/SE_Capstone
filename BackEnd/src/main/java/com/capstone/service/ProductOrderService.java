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
import com.capstone.entity.Cart;
import com.capstone.entity.CartItem;
import com.capstone.service.CartService;
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
    private final CartService cartService;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Transactional
    public OrderResponse createOrderFromCurrentUserCart(String address, String phoneNumber, String paymentMethod) {
        User user = getCurrentUser();
        Cart cart = cartService.getCartEntityByUserId(user.getId());

        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            int quantityToOrder = cartItem.getQuantity();

            if (product.getStock() < quantityToOrder) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Product " + product.getName() + " has insufficient stock.");
            }

            double itemPrice = product.getPrice() * quantityToOrder;
            totalAmount += itemPrice;

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(quantityToOrder)
                    .price(product.getPrice()) // Price at the time of order
                    .build();
            orderItems.add(orderItem);
        }

        if ("USER_BALANCE".equalsIgnoreCase(paymentMethod)) {
            if (user.getBalance() < totalAmount) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }
            // Balance will be deducted after order is successfully saved
        }

        ProductOrder order = ProductOrder.builder()
                .user(user)
                .totalAmount(totalAmount)
                .address(address)
                .phoneNumber(phoneNumber)
                .paymentMethod(paymentMethod)
                // status will be set by @PrePersist in ProductOrder entity to PENDING_CONFIRMATION
                .orderItems(new ArrayList<>()) // Initialize to be populated later
                .build();

        ProductOrder savedOrder = productOrderRepository.save(order); // Save order first to get ID

        List<OrderItem> savedOrderItems = new ArrayList<>();
        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder); // Link order item to the saved order
            savedOrderItems.add(orderItemRepository.save(oi)); // Save each order item

            // Update product stock
            Product productToUpdate = oi.getProduct();
            productToUpdate.setStock(productToUpdate.getStock() - oi.getQuantity());
            productRepository.save(productToUpdate);
        }
        savedOrder.setOrderItems(savedOrderItems); // Set the managed order items to the order
        // productOrderRepository.save(savedOrder); // Re-save if needed, though items association should be managed.

        if ("USER_BALANCE".equalsIgnoreCase(paymentMethod)) {
            user.setBalance(user.getBalance() - totalAmount);
            userRepository.save(user);
        }

        cartService.clearCart(); // Clear the cart after successful order

        return orderMapper.toOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse purchaseProduct(List<ProductPurchaseRequest> requests) {
        User user = getCurrentUser();
        double totalAmount = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (ProductPurchaseRequest request : requests) {
            Product product = productService.findProductById(request.getProductId());
            if (product.getStock() < request.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            double itemPrice = product.getPrice() * request.getQuantity();
            totalAmount += itemPrice;
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();
            orderItems.add(orderItem);
        }

        if (user.getBalance() < totalAmount) {
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
        }

        ProductOrder order = ProductOrder.builder()
                .user(user)
                .totalAmount(totalAmount)
                .address(null) //  This old method does not collect address
                .phoneNumber(null) // This old method does not collect phone
                .paymentMethod("USER_BALANCE") // Assuming old method was always user balance
                // status will be set by @PrePersist
                .orderItems(new ArrayList<>()) 
                .build();
        
        ProductOrder savedOrder = productOrderRepository.save(order);
        
        List<OrderItem> finalOrderItems = new ArrayList<>();
        for (OrderItem oi : orderItems) {
            Product product = oi.getProduct();
            product.setStock(product.getStock() - oi.getQuantity());
            productRepository.save(product);
            oi.setOrder(savedOrder);
            finalOrderItems.add(orderItemRepository.save(oi));
        }
        savedOrder.setOrderItems(finalOrderItems);
        // productOrderRepository.save(savedOrder); // Optional re-save
        
        user.setBalance(user.getBalance() - totalAmount);
        userRepository.save(user);
        
        return orderMapper.toOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders() {
        User user = getCurrentUser();
        List<ProductOrder> orders = productOrderRepository.findByUserOrderByOrderDateDesc(user);
        return orderMapper.toOrderResponseList(orders);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId) {
        User user = getCurrentUser();
        ProductOrder order = productOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Allow user to see their own order or admin to see any order
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().getName().equals("ADMIN")) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "You are not authorized to view this order.");
        }
        return orderMapper.toOrderResponse(order);
    }

    // Admin methods
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersForAdmin() {
        // Consider adding pagination for admin view if order volume is high
        List<ProductOrder> orders = productOrderRepository.findAllByOrderByOrderDateDesc();
        return orderMapper.toOrderResponseList(orders);
    }

    @Transactional
    public OrderResponse updateOrderStatusForAdmin(String orderId, String status) {
        // Basic validation for status - can be enhanced with an Enum or a predefined list
        List<String> validStatuses = List.of("PENDING_CONFIRMATION", "PREPARING", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new AppException(ErrorCode.INVALID_PARAM, "Invalid order status: " + status);
        }

        ProductOrder order = productOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Add any business logic for status transitions if needed
        // For example, an order cannot go from DELIVERED back to PREPARING
        // Or if status is CANCELLED, potentially revert stock (complex, handle with care)

        order.setStatus(status.toUpperCase());
        ProductOrder updatedOrder = productOrderRepository.save(order);

        // TODO: Add notification logic here if required (e.g., notify user of status change)

        return orderMapper.toOrderResponse(updatedOrder);
    }
} 