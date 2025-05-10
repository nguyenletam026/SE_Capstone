import React, { useState, useEffect } from "react";
import { getAllProducts, searchProducts } from "../../lib/user/productServices";
import ProductCard from "../../components/product/ProductCard";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { cart, addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await getAllProducts();
        setProducts(response.result || []);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      const response = await getAllProducts();
      setProducts(response.result || []);
      return;
    }
    try {
      setLoadingProducts(true);
      const response = await searchProducts(searchTerm);
      setProducts(response.result || []);
    } catch (error) {
      toast.error("Failed to search products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock < 1) {
        toast.warning("This product is out of stock.");
        return;
    }
    
    addItem(product.id, 1); 
  };

  const goToCart = () => {
    navigate("/cart");
  };

  const totalCartItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Health Products
        </h1>
        
        <motion.button
          onClick={goToCart}
          className="relative bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCartOutlined style={{ fontSize: '20px' }} />
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {totalCartItems}
            </span>
          )}
        </motion.button>
      </div>
      
      <div className="mb-8">
        <div className="flex w-full max-w-lg mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition-colors"
            disabled={loadingProducts}
          >
            {loadingProducts ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {loadingProducts || cartLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />
              <p className="text-gray-600 mt-4 text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 