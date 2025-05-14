package com.capstone.repository;

import com.capstone.entity.ProductOrder;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductOrderRepository extends JpaRepository<ProductOrder, String> {
    List<ProductOrder> findByUserOrderByOrderDateDesc(User user);
} 