package com.capstone.repository;

import com.capstone.entity.OrderItem;
import com.capstone.entity.ProductOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
    List<OrderItem> findByOrder(ProductOrder order);
} 