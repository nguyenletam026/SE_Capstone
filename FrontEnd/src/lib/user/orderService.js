import api from "../apiService";

// Create a new order from cart
export const createOrderAPI = async (address, phoneNumber, paymentMethod) => {
  try {
    const response = await api.post("/api/orders/create-from-cart", { 
      address,
      phoneNumber,
      paymentMethod 
    });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get current user's orders
export const getUserOrdersAPI = async () => {
  try {
    const response = await api.get("/api/orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Get order details by ID
export const getOrderByIdAPI = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order by ID:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Note: The old purchaseProducts from productServices.js should be updated or removed.
// If kept, it should ideally call createOrderAPI or be refactored. 