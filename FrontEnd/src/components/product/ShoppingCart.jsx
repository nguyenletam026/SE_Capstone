import React, { useState } from "react";
import { formatCurrency } from "../../lib/utils";
import { purchaseProducts } from "../../lib/user/productServices";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShoppingCartOutlined, 
  DeleteOutlined, 
  CloseOutlined,
  ShoppingOutlined,
  PlusOutlined,
  MinusOutlined,
  CreditCardOutlined,
  HistoryOutlined
} from "@ant-design/icons";

export default function ShoppingCart({ cart, updateQuantity, removeFromCart, clearCart }) {
  const [isLoading, setIsLoading] = useState(false);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handlePurchase = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsLoading(true);
      
      // Make sure each item has the correct productId property
      const purchaseRequests = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      // Call purchase API
      const response = await purchaseProducts(purchaseRequests);
      console.log("Purchase response:", response);
      
      toast.success("Purchase successful! 🎉");
      clearCart();
      
      // Redirect to order history after successful purchase
      setTimeout(() => {
        window.location.href = "/orders";
      }, 1500);
      
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to complete purchase");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 mt-4"
      >
        <div className="text-center">
          <ShoppingCartOutlined style={{ fontSize: '64px', color: '#d1d5db' }} />
          <h2 className="text-2xl font-bold mt-4 mb-2 text-gray-800">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingOutlined className="mr-2" /> Browse Products
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-6 mt-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <ShoppingCartOutlined className="mr-2" /> Your Cart 
          <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </h2>
        <Link 
          to="/orders" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <HistoryOutlined className="mr-1" /> Order History
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {cart.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="flex items-center mb-4 sm:mb-0">
              {item.imageUrl && (
                <div className="relative w-20 h-20 mr-4 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm">{formatCurrency(item.price)} each</p>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {item.stock} in stock
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  <MinusOutlined />
                </button>
                <span className="px-4 py-1 font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  <PlusOutlined />
                </button>
              </div>
              <div className="font-medium text-blue-600">
                {formatCurrency(item.price * item.quantity)}
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 transition-colors flex items-center ml-auto sm:ml-0"
              >
                <DeleteOutlined className="mr-1" /> Remove
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-8 pt-6 border-t border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gray-50 p-5 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium">Free</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
            <span className="font-bold text-gray-800 text-lg">Total:</span>
            <span className="font-bold text-blue-600 text-lg">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <button
            onClick={clearCart}
            className="px-5 py-2.5 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <CloseOutlined className="mr-2" /> Clear Cart
          </button>
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center transition-colors sm:flex-1"
          >
            {isLoading ? (
              <>
                <span className="mr-2 animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Processing...
              </>
            ) : (
              <>
                <CreditCardOutlined className="mr-2" /> Complete Purchase
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 