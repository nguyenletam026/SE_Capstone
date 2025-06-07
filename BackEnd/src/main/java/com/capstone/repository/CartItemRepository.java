package com.capstone.repository;

import com.capstone.entity.Cart;
import com.capstone.entity.CartItem;
import com.capstone.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    void deleteByCart_IdAndId(String cartId, String cartItemId);
    void deleteByCart_Id(String cartId);
} 