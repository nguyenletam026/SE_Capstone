package com.capstone.service;

import com.capstone.dto.response.CartResponse;
import com.capstone.entity.Cart;
import com.capstone.entity.CartItem;
import com.capstone.entity.Product;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.mapper.CartMapper;
import com.capstone.repository.CartItemRepository;
import com.capstone.repository.CartRepository;
import com.capstone.repository.ProductRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final CartMapper cartMapper;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Transactional
    public CartResponse addItemToCart(String productId, int quantity) {
        User user = getCurrentUser();
        Product product = productService.findProductById(productId);

        if (product.getStock() < quantity) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = Cart.builder().user(user).items(new ArrayList<>()).build();
            return cartRepository.save(newCart);
        });

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            if (product.getStock() < item.getQuantity() + quantity) {
                 throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Adding this quantity would exceed available stock.");
            }
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            if (product.getStock() < quantity) { // Re-check for new item scenario (though covered above)
                 throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem); // Ensure the item is added to the cart's list for the response
            cartItemRepository.save(newItem); // JPA will handle saving this new item
        }
        // cartRepository.save(cart); // Not strictly necessary if cascades are set up or if only items are changing
        return cartMapper.toCartResponse(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> Cart.builder().user(user).items(new ArrayList<>()).build()); // Return empty cart representation if none exists
        return cartMapper.toCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItem(String cartItemId, int quantity) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Cart item does not belong to the current user's cart.");
        }

        Product product = item.getProduct();
        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (product.getStock() < quantity) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        // cartRepository.save(cart); // May not be needed if only item changes
        // Refetch cart to ensure all items are correctly loaded for the response
        Cart updatedCart = cartRepository.findByUserId(user.getId()).orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
        return cartMapper.toCartResponse(updatedCart);
    }

    @Transactional
    public CartResponse removeCartItem(String cartItemId) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Cart item does not belong to the current user's cart.");
        }

        cart.getItems().remove(item); // Important for the response mapper
        cartItemRepository.delete(item);
        // cartRepository.save(cart); // To update the cart's state if necessary (e.g., total amount if cart stores it)
        // Refetch cart to ensure consistent state for response
        Cart updatedCart = cartRepository.findByUserId(user.getId()).orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
        return cartMapper.toCartResponse(updatedCart);
    }

    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart != null) {
            // Efficiently delete all items belonging to the cart
            cartItemRepository.deleteByCart_Id(cart.getId());
            // Optionally, you might want to delete the cart entity itself if it's empty
            // or keep it for future use. For now, just clearing items.
            cart.getItems().clear(); // Clear in-memory list for the response
            cartRepository.save(cart); // Persist the cleared items list
        }
    }
     @Transactional(readOnly = true)
    public Cart getCartEntityByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                    Cart newCart = Cart.builder().user(user).items(new ArrayList<>()).build();
                    return cartRepository.save(newCart); // Save and return the new cart
                });
    }
} 