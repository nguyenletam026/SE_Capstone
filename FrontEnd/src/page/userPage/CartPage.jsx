import React, { useState, useEffect } from "react";
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
  HistoryOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Cart, 1: Confirmation, 2: Success

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          // Make sure the quantity doesn't exceed the stock
          const quantity = Math.min(newQuantity, item.stock);
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Cart cleared");
  };

  const handlePurchase = async () => {
    if (checkoutStep === 0) {
      // Move to confirmation step
      setCheckoutStep(1);
      return;
    }

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
      
      // Show success step
      setCheckoutStep(2);
      clearCart();
      
      // Redirect to order history after successful purchase
      setTimeout(() => {
        window.location.href = "/orders";
      }, 3000);
      
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to complete purchase");
      setCheckoutStep(0); // Go back to cart on error
    } finally {
      setIsLoading(false);
    }
  };

  // Render different steps of the checkout process
  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 1: // Confirmation step
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Confirm Your Order</h2>
            
            <div className="mb-6 border-b pb-6">
              <h3 className="font-semibold mb-3 text-gray-700">Order Summary</h3>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-200">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            
            <div className="mb-6 border-b pb-6">
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Shipping</p>
                <p className="font-medium">Free</p>
              </div>
            </div>
            
            <div className="flex justify-between mb-6">
              <p className="text-lg font-bold text-gray-800">Total</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCheckoutStep(0)}
                className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <ArrowLeftOutlined className="mr-2" /> Back to Cart
              </button>
              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="px-5 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-75 flex items-center justify-center transition-colors sm:flex-1"
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
        );
        
      case 2: // Success step
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleOutlined style={{ fontSize: '40px', color: '#10B981' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. Your order is being processed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingOutlined className="mr-2" /> Continue Shopping
              </Link>
              <Link
                to="/orders"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <HistoryOutlined className="mr-2" /> View Order History
              </Link>
            </div>
          </motion.div>
        );
        
      default: // Cart step (0)
        if (cart.length === 0) {
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-10 text-center"
            >
              <ShoppingCartOutlined style={{ fontSize: '64px', color: '#d1d5db' }} />
              <h2 className="text-2xl font-bold mt-6 mb-2 text-gray-800">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingOutlined className="mr-2" /> Browse Products
              </Link>
            </motion.div>
          );
        }
        
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
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
                  className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center"
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
                <div className="flex gap-3">
                  <Link
                    to="/products"
                    className="px-5 py-3 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <ArrowLeftOutlined className="mr-2" /> Continue Shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="px-5 py-3 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <CloseOutlined className="mr-2" /> Clear Cart
                  </button>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="px-5 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center transition-colors sm:flex-1"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardOutlined className="mr-2" /> Proceed to Checkout
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Shopping Cart</h1>
      {renderCheckoutStep()}
    </div>
  );
} 