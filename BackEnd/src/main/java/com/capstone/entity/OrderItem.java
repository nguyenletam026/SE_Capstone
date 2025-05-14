package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "order_items")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    ProductOrder order;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    Product product;
    
    @Column(nullable = false)
    Integer quantity;
    
    @Column(nullable = false)
    Double price; // Price at time of purchase
} 