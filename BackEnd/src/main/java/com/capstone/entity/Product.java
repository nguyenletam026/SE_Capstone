package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "products")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    
    @Column(nullable = false)
    String name;
    
    @Column(nullable = false, length = 1000)
    String description;
    
    @Column(nullable = false)
    Double price;
    
    @Column(nullable = false)
    Integer stock;
    
    String imageUrl;
    
    @Column(nullable = false)
    Date createdAt;
    
    Date updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
} 