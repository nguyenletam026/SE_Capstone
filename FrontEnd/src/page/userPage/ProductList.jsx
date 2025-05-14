import React, { useState, useEffect } from "react";
import { getAllProducts, searchProducts } from "../../lib/user/productServices";
import ProductCard from "../../components/product/ProductCard";
import ShoppingCart from "../../components/product/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        setProducts(response.result || []);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If search is empty, fetch all products
      const response = await getAllProducts();
      setProducts(response.result || []);
      return;
    }

    try {
      setLoading(true);
      const response = await searchProducts(searchTerm);
      setProducts(response.result || []);
    } catch (error) {
      toast.error("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if product is already in cart
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if not exceeding stock
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast.warning("Cannot add more of this item (stock limit reached)");
          return prevCart;
        }
      } else {
        // Add new item to cart
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Health Products
      </h1>
      
      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <div className="flex w-full max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <p className="text-center text-gray-600">No products found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Shopping Cart */}
      <ShoppingCart
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
    </div>
  );
} 