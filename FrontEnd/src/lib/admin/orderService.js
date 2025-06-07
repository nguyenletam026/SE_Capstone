import api from "../apiService";

// Get all orders for admin
export const getAllOrdersAdminAPI = async () => {
  try {
    const response = await api.get("/api/orders/admin/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders for admin:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update order status for admin
export const updateOrderStatusAdminAPI = async (orderId, status) => {
  try {
    const response = await api.put(`/api/orders/admin/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating order status for admin:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
}; 