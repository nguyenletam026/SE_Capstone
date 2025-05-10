import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../lib/utils";
import { createOrderAPI } from "../../lib/user/orderService"; // Use new order service
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext"; // Import useCart
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
  HomeOutlined,
  PhoneOutlined,
  WalletOutlined,
  DollarCircleOutlined
} from "@ant-design/icons";

export default function CartPage() {
  const { 
    cart, 
    loading: cartLoading, 
    error: cartError, 
    updateItemQuantity, 
    removeItem, 
    clearCartItems,
    fetchCart // To refresh cart after order
  } = useCart();
  
  const navigate = useNavigate();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Cart, 1: Address/Payment, 2: Confirmation, 3: Success

  // Form state for address and payment
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Default to Cash on Delivery

  // Fetch cart if it's empty and not loading (e.g., direct navigation to cart page)
  useEffect(() => {
    if (!cartLoading && (!cart || !cart.id)) {
      fetchCart();
    }
  }, [cart, cartLoading, fetchCart]);

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item.id); // Assuming item has cartItemId as id
      return;
    }
    if (newQuantity > item.stock) {
      toast.warn(`Cannot add more than ${item.stock} items (stock limit).`);
      updateItemQuantity(item.id, item.stock);
      return;
    }
    updateItemQuantity(item.id, newQuantity);
  };

  const handleRemoveItem = (cartItemId) => {
    removeItem(cartItemId);
  };

  const handleClearCart = () => {
    clearCartItems();
  };

  const proceedToAddressStep = () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setCheckoutStep(1);
  };

  const proceedToConfirmationStep = (e) => {
    e.preventDefault(); // Prevent form submission if it's a form
    if (!address.trim()) {
      toast.error("Please enter your delivery address.");
      return;
    }
    if (!phoneNumber.trim()) { // Basic phone validation
      toast.error("Please enter your phone number.");
      return;
    }
    if (!paymentMethod) {
        toast.error("Please select a payment method.");
        return;
    }
    setCheckoutStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setIsProcessingOrder(true);
    try {
      const response = await createOrderAPI(address, phoneNumber, paymentMethod);
      if (response.result) {
        toast.success("Order placed successfully! 🎉");
        setCheckoutStep(3); // Move to success step
        // Cart is cleared on backend, CartContext will refetch/update
        // No need to call clearCartItems() here as backend handles it and context refreshes
      } else {
        toast.error(response.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.message || "An unexpected error occurred. Failed to place order.");
      // Optionally, navigate back to cart or address step
      // setCheckoutStep(1); 
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const renderCartItems = (items, isConfirmation = false) => {
    if (!items || items.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-10 text-center my-8"
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
      <div className={`divide-y divide-gray-200 ${isConfirmation ? 'mb-6' : ''}`}>
        {items.map((item) => (
          <motion.div
            key={item.id} // Ensure this is cartItem.id
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >            <div className="flex items-center mb-4 sm:mb-0 flex-grow">
              {item.productImageUrl && (
                <div className="relative w-20 h-20 mr-4 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 mb-1">{item.productName || 'Product Name Unavailable'}</h3>
                <p className="text-gray-600 text-sm">{formatCurrency(item.price || 0)} each</p>
                {!isConfirmation && item.stock !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                        Available: {item.stock}
                    </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center sm:ml-4 shrink-0">
              {!isConfirmation ? (
                <div className="flex items-center border border-gray-300 rounded-md mr-4">
                  <button
                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                    className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-l-md focus:outline-none"
                    aria-label="Decrease quantity"
                    disabled={cartLoading}
                  >
                    <MinusOutlined />
                  </button>
                  <span className="px-4 py-1.5 text-gray-800 border-l border-r border-gray-300 min-w-[40px] text-center">
                    {item.quantity}
                  </span>                  <button
                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                    className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-r-md focus:outline-none"
                    aria-label="Increase quantity"
                    disabled={cartLoading || item.quantity >= item.stock}
                  >
                    <PlusOutlined />
                  </button>
                </div>
              ) : (
                <p className="text-gray-700 mr-4">Qty: {item.quantity}</p>
              )}              <p className="font-semibold text-gray-800 w-24 text-right mr-4">
                {formatCurrency((item.price || 0) * item.quantity)}
              </p>
              {!isConfirmation && (
                <button
                  onClick={() => handleRemoveItem(item.id)} // cartItem.id
                  className="text-red-500 hover:text-red-700 transition-colors"
                  disabled={cartLoading}
                  aria-label="Remove item"
                >
                  <DeleteOutlined style={{ fontSize: '18px' }} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderCartSummary = () => {
    const subtotal = cart?.totalAmount || 0;
    // Assuming shipping is free for now, can be made dynamic
    const shipping = 0;
    const total = subtotal + shipping;

    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 p-5 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium">{shipping > 0 ? formatCurrency(shipping) : 'Free'}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
            <span className="font-bold text-gray-800 text-lg">Total:</span>
            <span className="font-bold text-blue-600 text-lg">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCheckoutStepContent = () => {
    switch (checkoutStep) {
      case 0: // Cart View
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <ShoppingCartOutlined className="mr-2" /> Your Cart
                {cart?.items?.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                  </span>
                )}
              </h2>
              <Link to="/orders" className="text-blue-600 hover:text-blue-800 flex items-center">
                <HistoryOutlined className="mr-1" /> Order History
              </Link>
            </div>
            {cartLoading && <p className="text-center py-4">Loading cart...</p>}
            {cartError && <p className="text-center py-4 text-red-500">Error loading cart: {cartError}</p>}
            {!cartLoading && !cartError && renderCartItems(cart?.items)}
            {!cartLoading && !cartError && cart?.items?.length > 0 && (
              <>
                {renderCartSummary()}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6">
                  <div className="flex gap-3">
                    <Link
                      to="/products"
                      className="px-5 py-3 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <ArrowLeftOutlined className="mr-2" /> Continue Shopping
                    </Link>
                    <button
                      onClick={handleClearCart}
                      className="px-5 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center justify-center transition-colors"
                      disabled={cartLoading}
                    >
                      <CloseOutlined className="mr-2" /> Clear Cart
                    </button>
                  </div>
                  <button
                    onClick={proceedToAddressStep}
                    className="px-5 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 flex items-center justify-center transition-colors sm:flex-1"
                  >
                    <CreditCardOutlined className="mr-2" /> Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        );
      
      case 1: // Address & Payment Form
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Shipping & Payment</h2>
            <form onSubmit={proceedToConfirmationStep}>
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  <HomeOutlined className="mr-2" />Delivery Address
                </label>
                <textarea
                  id="address"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="123 Main St, Anytown, USA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  <PhoneOutlined className="mr-2" />Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  <WalletOutlined className="mr-2" />Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-600">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-800">
                      <DollarCircleOutlined className="mr-2" />Cash on Delivery (COD)
                    </span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-600">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="USER_BALANCE"
                      checked={paymentMethod === "USER_BALANCE"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-800">
                      <CreditCardOutlined className="mr-2" />Pay with User Balance
                    </span>
                     {/* Optionally show balance if available from user context */}
                  </label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep(0)}
                  className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <ArrowLeftOutlined className="mr-2" /> Back to Cart
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 flex items-center justify-center transition-colors sm:flex-1"
                >
                  Review Order <ArrowLeftOutlined className="mr-2 rotate-180 ml-2" />
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 2: // Confirmation
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Confirm Your Order</h2>
            <div className="mb-6 border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Shipping Details:</h3>
                <p className="text-gray-600"><HomeOutlined className="mr-2" />Address: {address}</p>
                <p className="text-gray-600"><PhoneOutlined className="mr-2" />Phone: {phoneNumber}</p>
                <p className="text-gray-600"><WalletOutlined className="mr-2" />Payment: {paymentMethod === "COD" ? "Cash on Delivery" : "User Balance"}</p>
            </div>
            <div className="mb-6 border-b pb-4">
              <h3 className="font-semibold mb-3 text-gray-700">Order Summary:</h3>
              {renderCartItems(cart?.items, true)}
            </div>
            {renderCartSummary()}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setCheckoutStep(1)}
                className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
                disabled={isProcessingOrder}
              >
                <ArrowLeftOutlined className="mr-2" /> Back to Edit
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessingOrder || cartLoading}
                className="px-5 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 disabled:opacity-75 flex items-center justify-center transition-colors sm:flex-1"
              >
                {isProcessingOrder ? (
                  <><span className="mr-2 animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>Processing...</>
                ) : (
                  <><CheckCircleOutlined className="mr-2" /> Place Order</>
                )}
              </button>
            </div>
          </motion.div>
        );

      case 3: // Success
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleOutlined style={{ fontSize: '40px', color: '#10B981' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. Your order is being processed and you will be notified of updates.
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
      default:
        return null; // Should not happen
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl"> {/* Adjusted max-width for better form layout */}
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        {checkoutStep === 0 && "Shopping Cart"}
        {checkoutStep === 1 && "Shipping & Payment"}
        {checkoutStep === 2 && "Confirm Your Order"}
        {checkoutStep === 3 && "Order Successful"}
      </h1>
      {renderCheckoutStepContent()}
    </div>
  );
} 