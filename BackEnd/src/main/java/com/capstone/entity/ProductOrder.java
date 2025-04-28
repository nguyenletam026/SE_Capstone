package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "product_orders")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    
    @Column(nullable = false)
    Double totalAmount;
    
    @Column(nullable = false)
    Date orderDate;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    List<OrderItem> orderItems;
    
    @Column(nullable = true) // Allow null initially, to be set during checkout
    String address;
    
    @Column(nullable = true) // Allow null initially
    String phoneNumber;
    
    @Column(nullable = true) // e.g., "COD", "USER_BALANCE"
    String paymentMethod;
    
    @Column(nullable = false)
    String status; // e.g., "PENDING_CONFIRMATION", "PREPARING", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED"
    
    @PrePersist
    protected void onCreate() {
        orderDate = new Date();
        if (status == null) {
            status = "PENDING_CONFIRMATION"; // Default status
        }
    }
} 