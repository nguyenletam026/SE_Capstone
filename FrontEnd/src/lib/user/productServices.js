import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

// Get all products
export const getAllProducts = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};

// Get product by ID
export const getProductById = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
};

// Search products by name
export const searchProducts = async (name) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/products/search?name=${encodeURIComponent(name)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  return response.json();
};

// Purchase products
export const purchaseProducts = async (products) => {
  const token = getToken();
  
  // Debug the request for better troubleshooting
  console.log("Purchase request:", products);
  
  try {
    const response = await fetch(`${API_BASE}/api/orders/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(products),
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      
      // Try to parse the error response as JSON
      try {
        if (errorText && errorText.trim()) {
          const errorData = JSON.parse(errorText);
          
          // Handle known error codes
          if (errorData.code === 1031) {
            throw new Error("Not enough product stock available");
          } else if (errorData.code === 1032) {
            throw new Error("Insufficient balance to complete purchase");
          } else if (errorData.code === 1029) {
            throw new Error("One or more products not found");
          } else if (errorData.code === 9999) {
            // Handle server error with a more user-friendly message
            console.error("Server error details:", errorData.message);
            throw new Error("Server error occurred. Please try again later.");
          } else {
            throw new Error(errorData.message || "Failed to purchase products");
          }
        } else {
          throw new Error("Failed to purchase products");
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Failed to purchase products");
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Purchase error:", error);
    throw error;
  }
};

// Get user orders
export const getUserOrders = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
};

// Get order by ID
export const getOrderById = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch order");
  }

  return response.json();
}; 