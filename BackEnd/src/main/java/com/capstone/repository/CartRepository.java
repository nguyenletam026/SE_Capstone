package com.capstone.repository;

import com.capstone.entity.Cart;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    Optional<Cart> findByUser(User user);
    Optional<Cart> findByUserId(String userId);
} 