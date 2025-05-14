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
    
    @PrePersist
    protected void onCreate() {
        orderDate = new Date();
    }
} 