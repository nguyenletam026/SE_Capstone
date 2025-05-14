import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../lib/user/productServices";
import { formatCurrency } from "../../lib/utils";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.result);
      } catch (error) {
        toast.error("Failed to load product details");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    // Get current cart from local storage
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Check if product already in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      const newQuantity = cartItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        toast.warning(`Cannot add more than ${product.stock} items due to stock limitations`);
        return;
      }
      
      cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new product to cart
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity,
        stock: product.stock
      });
    }
    
    // Save updated cart to local storage
    localStorage.setItem("cart", JSON.stringify(cartItems));
    
    toast.success(`${product.name} added to cart`);
    navigate("/products");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600">Product not found</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/products")}
        className="mb-6 inline-flex items-center text-blue-500 hover:text-blue-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Products
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[300px] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        <div className="p-6 md:w-1/2">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-blue-600 mb-4">
            {formatCurrency(product.price)}
          </p>
          <div className="bg-gray-100 p-4 rounded mb-6">
            <h2 className="font-bold text-lg mb-2 text-gray-800">
              Product Details
            </h2>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <p className="text-gray-700">
              <span className="font-semibold">Availability:</span>{" "}
              {product.stock > 0
                ? `In Stock (${product.stock} available)`
                : "Out of Stock"}
            </p>
          </div>

          {product.stock > 0 ? (
            <>
              <div className="flex items-center mb-6">
                <span className="mr-4 font-semibold">Quantity:</span>
                <div className="flex">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-200 rounded-l text-gray-800 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-t border-b">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-1 bg-gray-200 rounded-r text-gray-800 hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add to Cart
              </button>
            </>
          ) : (
            <button
              disabled
              className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 