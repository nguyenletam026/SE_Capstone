import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    addItemToCartAPI,
    getCartAPI,
    updateCartItemAPI,
    removeCartItemAPI,
    clearCartAPI
} from '../lib/user/cartService';
import { getToken } from '../services/localStorageService';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0, id: null, userId: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch cart from backend
    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await getCartAPI();
            if (response.result) {
                setCart(response.result);
            } else {
                 // Handle case where cart might be null or not in expected format initially
                setCart({ items: [], totalAmount: 0, id: null, userId: null });
            }
            setError(null);
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            setError(err.message || 'Failed to fetch cart');
            // Optionally, clear local cart or show a persistent error
        } finally {
            setLoading(false);
        }
    };    // Fetch cart on initial load (e.g., when app starts or user logs in)
    // This depends on how authentication is handled. For now, let's assume it's called appropriately.
    useEffect(() => {
        // We need a way to know if the user is authenticated before fetching.
        // For now, let's assume this is handled and fetchCart is called when appropriate.
        // Example: if (isAuthenticated) fetchCart();
        // For demonstration, fetching on mount if there's a token (might need adjustment)
        const token = getToken();
        if (token) {
            fetchCart();
        }
    }, []);

    const addItem = async (productId, quantity) => {
        setLoading(true);
        try {
            const response = await addItemToCartAPI(productId, quantity);
            if (response.result) {
                setCart(response.result);
                toast.success('Item added to cart!');
            } else {
                toast.error(response.message || 'Failed to add item.');
            }
            setError(null);
        } catch (err) {
            console.error("Failed to add item to cart:", err);
            toast.error(err.message || 'Could not add item to cart.');
            setError(err.message || 'Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    const updateItemQuantity = async (cartItemId, quantity) => {
        setLoading(true);
        try {
            const response = await updateCartItemAPI(cartItemId, quantity);
            if (response.result) {
                setCart(response.result);
                toast.info('Cart updated.');
            } else {
                toast.error(response.message || 'Failed to update cart.');
            }
            setError(null);
        } catch (err) {
            console.error("Failed to update cart item:", err);
            toast.error(err.message || 'Could not update cart item.');
            setError(err.message || 'Failed to update item');
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (cartItemId) => {
        setLoading(true);
        try {
            const response = await removeCartItemAPI(cartItemId);
            if (response.result) {
                setCart(response.result);
                toast.info('Item removed from cart.');
            } else {
                toast.error(response.message || 'Failed to remove item.');
            }
            setError(null);
        } catch (err) {
            console.error("Failed to remove cart item:", err);
            toast.error(err.message || 'Could not remove item from cart.');
            setError(err.message || 'Failed to remove item');
        } finally {
            setLoading(false);
        }
    };

    const clearCartItems = async () => {
        setLoading(true);
        try {
            const response = await clearCartAPI();
            if (response.result) { // Backend returns a success message
                fetchCart(); // Refetch the cart which should now be empty or a new one
                toast.info('Cart cleared.');
            } else {
                toast.error(response.message || 'Failed to clear cart.');
            }
            setError(null);
        } catch (err) {
            console.error("Failed to clear cart:", err);
            toast.error(err.message || 'Could not clear cart.');
            setError(err.message || 'Failed to clear cart');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, error, fetchCart, addItem, updateItemQuantity, removeItem, clearCartItems }}>
            {children}
        </CartContext.Provider>
    );
}; 