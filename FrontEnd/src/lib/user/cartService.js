import api from "../apiService";

// Add item to cart
export const addItemToCartAPI = async (productId, quantity) => {
  try {
    const response = await api.post("/api/cart/items", { productId, quantity });
    return response.data;
  } catch (error) {
    console.error("Error adding item to cart:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get current user's cart
export const getCartAPI = async () => {
  try {
    const response = await api.get("/api/cart");
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update item quantity in cart
export const updateCartItemAPI = async (cartItemId, quantity) => {
  try {
    const response = await api.put(`/api/cart/items/${cartItemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Remove item from cart
export const removeCartItemAPI = async (cartItemId) => {
  try {
    const response = await api.delete(`/api/cart/items/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Clear all items from cart
export const clearCartAPI = async () => {
  try {
    const response = await api.delete("/api/cart");
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}; 