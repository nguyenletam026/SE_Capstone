import React, { useState, useEffect, useCallback, useRef } from "react";
import { formatCurrency } from "../../lib/utils";
import { createOrderAPI } from "../../lib/user/orderService";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCreditCard, FiArrowLeft, FiCheckCircle, FiHome, FiPhone, FiArrowRight, FiMapPin, FiSearch, FiTarget } from "react-icons/fi";

export default function CartPage() {
  const { cart, loading: cartLoading, error: cartError, updateItemQuantity, removeItem, clearCartItems, fetchCart } = useCart();
  const navigate = useNavigate();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  // Address autocomplete states
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);

  // Quantity input state for individual items
  const [quantityInputs, setQuantityInputs] = useState({});

  const GOONG_API_KEY = "Vdl76qC064CJ5q05tJfCqrSW51c8FWnh5uGIAPVa";

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.id)) {
      fetchCart();
    }
  }, [cart, cartLoading, fetchCart]);

  // Initialize quantity inputs when cart loads
  useEffect(() => {
    if (cart?.items) {
      const inputs = {};
      cart.items.forEach(item => {
        inputs[item.id] = item.quantity;
      });
      setQuantityInputs(inputs);
    }
  }, [cart?.items]);

  // Debounced address search
  const searchAddresses = useCallback(async (query) => {
    if (!query.trim()) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.status === "OK" && data.predictions) {
        setAddressSuggestions(data.predictions);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
    }
  }, []);

  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setAddressQuery(value);
    setShowSuggestions(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  const handleSelectAddress = (suggestion) => {
    setAddress(suggestion.description);
    setAddressQuery(suggestion.description);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`
          );
          const data = await response.json();
          
          if (data.status === "OK" && data.results && data.results.length > 0) {
            const location = data.results[0];
            setAddress(location.formatted_address);
            setAddressQuery(location.formatted_address);
            setShowSuggestions(false);
            toast.success("Location detected successfully!");
          } else {
            toast.error("Unable to get address from location.");
          }
        } catch (error) {
          console.error("Error getting address from location:", error);
          toast.error("Error getting address from location.");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("The request to get user location timed out.");
            break;
          default:
            toast.error("An unknown error occurred.");
            break;
        }
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressInputRef.current && !addressInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enhanced quantity handlers
  const handleQuantityInputChange = (itemId, value) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setQuantityInputs(prev => ({
      ...prev,
      [itemId]: numericValue
    }));
  };

  const handleQuantityInputBlur = (item) => {
    const inputValue = quantityInputs[item.id];
    const newQuantity = parseInt(inputValue) || 1;
    
    if (newQuantity <= 0) {
      handleRemoveItem(item.id);
      return;
    }
    
    if (newQuantity > item.stock) {
      toast.warn(`Cannot add more than ${item.stock} items in stock.`);
      const finalQuantity = Math.min(newQuantity, item.stock);
      setQuantityInputs(prev => ({
        ...prev,
        [item.id]: finalQuantity
      }));
      updateItemQuantity(item.id, finalQuantity);
      return;
    }
    
    updateItemQuantity(item.id, newQuantity);
  };

  const handleQuantityInputKeyPress = (e, item) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item.id);
      return;
    }
    if (newQuantity > item.stock) {
      toast.warn(`Cannot add more than ${item.stock} items in stock.`);
      const finalQuantity = item.stock;
      setQuantityInputs(prev => ({
        ...prev,
        [item.id]: finalQuantity
      }));
      updateItemQuantity(item.id, finalQuantity);
      return;
    }
    
    setQuantityInputs(prev => ({
      ...prev,
      [item.id]: newQuantity
    }));
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
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter your delivery address.");
      return;
    }
    if (!phoneNumber.trim()) {
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
        toast.success("Order placed successfully!");
        setCheckoutStep(3);
      } else {
        toast.error(response.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // ... (keep all the existing imports and logic)

const renderCartItems = (items, isConfirmation = false) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-full mb-8 shadow-inner">
          <FiShoppingCart className="w-12 h-12 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
          Looks like you haven't added any items to your cart yet. Start exploring our amazing products and find something perfect for you!
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl group"
        >
          <FiSearch className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
          Discover Products
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className="relative group bg-gradient-to-br from-white to-gray-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-gray-100/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm animate-fadeInUp"
          style={{ 
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            {/* Enhanced Product Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl mx-auto sm:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              {item.productImageUrl ? (
                <div className="relative w-full h-full overflow-hidden rounded-lg sm:rounded-xl border-2 border-gray-200/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img 
                    src={item.productImageUrl} 
                    alt={item.productName} 
                    className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    style={{ imageRendering: 'crisp-edges' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-lg sm:rounded-xl items-center justify-center border border-gray-200/50 shadow-inner">
                    <FiShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-gray-200/50 shadow-inner">
                  <FiShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
              )}
              {!isConfirmation && item.stock !== undefined && item.stock > 0 && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg z-20">
                  {item.stock}
                </div>
              )}
            </div>
            
            {/* Enhanced Product Info */}
            <div className="flex-grow min-w-0 space-y-1 sm:space-y-2 w-full sm:w-auto text-center sm:text-left">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                {item.productName || "Product Name Unavailable"}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                <p className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(item.price || 0)}
                </p>
                {!isConfirmation && item.stock !== undefined && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-green-600 font-semibold">
                      {item.stock} in stock
                    </p>
                  </div>
                )}
              </div>
              
              {/* Enhanced Total Price */}
              <div className="pt-1 sm:pt-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
                <p className="text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {formatCurrency((item.price || 0) * item.quantity)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Quantity Controls - Mobile: Bottom Center, Desktop: Bottom Right */}
          {!isConfirmation ? (
            <div className={`${
              window.innerWidth < 640 
                ? 'flex justify-center mt-3 w-full' 
                : 'absolute bottom-4 right-4'
            } flex items-center space-x-1`}>
              {/* Compact Quantity Selector */}
              <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200/70 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Minus Button - Compact */}
                <button
                  onClick={() => handleUpdateQuantity(item, (quantityInputs[item.id] || item.quantity) - 1)}
                  className="group/btn p-1.5 sm:p-2 text-gray-500 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 flex items-center justify-center"
                  disabled={cartLoading || (quantityInputs[item.id] || item.quantity) <= 1}
                  title="Decrease quantity"
                >
                  <FiMinus className="w-3 h-3 group-hover/btn:scale-110 transition-transform duration-300" />
                </button>
                
                {/* Compact Quantity Input */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantityInputs[item.id] || item.quantity || 1}
                    onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                    onBlur={() => handleQuantityInputBlur(item)}
                    onKeyPress={(e) => handleQuantityInputKeyPress(e, item)}
                    className="w-8 sm:w-10 px-1 py-1.5 sm:py-2 text-center font-bold text-gray-900 bg-gradient-to-br from-gray-50 to-white border-x border-gray-200/70 focus:bg-gradient-to-br focus:from-blue-50 focus:to-indigo-50 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200/50 transition-all duration-300 text-xs sm:text-sm"
                    disabled={cartLoading}
                    min="1"
                    max={item.stock}
                  />
                  {/* Compact validation indicator */}
                  {quantityInputs[item.id] && parseInt(quantityInputs[item.id]) > item.stock && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Plus Button - Compact */}
                <button
                  onClick={() => handleUpdateQuantity(item, (quantityInputs[item.id] || item.quantity) + 1)}
                  className="group/btn p-2 text-gray-500 hover:text-white hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 flex items-center justify-center"
                  disabled={cartLoading || (quantityInputs[item.id] || item.quantity) >= item.stock}
                  title="Increase quantity"
                >
                  <FiPlus className="w-3 h-3 group-hover/btn:scale-110 transition-transform duration-300" />
                </button>
              </div>
              
              {/* Compact Remove Button */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/remove hover:scale-110 shadow-sm hover:shadow-md bg-white/90 backdrop-blur-sm border border-gray-200/70"
                disabled={cartLoading}
                title="Remove item"
              >
                <FiTrash2 className="w-3.5 h-3.5 group-hover/remove:scale-110 transition-transform duration-200" />
              </button>
            </div>
          ) : (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50 shadow-sm">
              <span className="font-bold text-blue-700 text-sm">
                {item.quantity} item{item.quantity > 1 ? "s" : ""}
              </span>
            </div>
          )}
          
          {/* Compact Stock Warning */}
          {!isConfirmation && quantityInputs[item.id] && parseInt(quantityInputs[item.id]) > item.stock && (
            <div className="absolute bottom-16 right-4 p-2 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <p className="text-red-600 text-xs font-medium">
                ⚠️ Only {item.stock} available
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ... (keep the rest of the component unchanged)

  const renderCartSummary = () => {
    const subtotal = cart?.totalAmount || 0;
    const shipping = 0;
    const total = subtotal + shipping;

    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm lg:sticky lg:top-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <FiCreditCard className="mr-2 sm:mr-3 text-blue-500" />
          Order Summary
        </h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">
              Subtotal ({cart?.items?.length || 0} items)
            </span>
            <span className="font-semibold text-gray-900 text-lg">
              {formatCurrency(subtotal)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold text-green-600 text-lg">
              Free ✨
            </span>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 bg-green-50 p-3 rounded-lg border border-green-200">
          🎉 You're getting free shipping on this order!
        </div>
      </div>
    );
  };

  const renderCheckoutStepContent = () => {
    switch (checkoutStep) {
      case 0: // Cart View
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h2>
                <p className="text-gray-600 mt-1">
                  {cart?.items?.length || 0} items in your cart
                </p>
              </div>
              {cart?.items?.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="flex items-center justify-center sm:justify-start px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-200 w-full sm:w-auto"
                  disabled={cartLoading}
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </button>
              )}
            </div>
            
            {cartLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading your cart...</p>
              </div>
            )}
            
            {cartError && (
              <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200">
                <p className="text-red-600 font-medium">❌ Error: {cartError}</p>
              </div>
            )}
            
            {!cartLoading && !cartError && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 order-2 lg:order-1">
                  {renderCartItems(cart?.items)}
                </div>
                
                {cart?.items?.length > 0 && (
                  <div className="lg:col-span-1 order-1 lg:order-2">
                    {renderCartSummary()}
                    <button
                      onClick={proceedToAddressStep}
                      className="w-full mt-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-base sm:text-lg"
                    >
                      Proceed to Checkout
                    </button>
                    <Link
                      to="/products"
                      className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      ← Continue Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 1: // Address & Payment Form
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <FiMapPin className="mr-3 text-blue-500" />
                Shipping & Payment Details
              </h2>
              
              <form onSubmit={proceedToConfirmationStep} className="space-y-8">
                {/* Address Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FiHome className="inline mr-2" />
                    Delivery Address *
                  </label>
                  
                  <div className="relative" ref={addressInputRef}>
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <textarea
                          rows="3"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                          placeholder="Enter your delivery address..."
                          value={addressQuery}
                          onChange={handleAddressInputChange}
                          onFocus={() => setShowSuggestions(addressSuggestions.length > 0)}
                          required
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isLoadingLocation}
                        className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                        title="Get current location"
                      >
                        {isLoadingLocation ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                          <FiTarget className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Address Suggestions Dropdown */}
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectAddress(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-900 text-sm">
                              {suggestion.structured_formatting?.main_text || suggestion.description}
                            </div>
                            {suggestion.structured_formatting?.secondary_text && (
                              <div className="text-xs text-gray-500 mt-1">
                                {suggestion.structured_formatting.secondary_text}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Start typing to get address suggestions or use the location button
                  </p>
                </div>

                {/* Phone Number Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FiPhone className="inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., +84 123 456 789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                {/* Payment Method Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <FiCreditCard className="mr-2" />
                    Payment Method *
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4 w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          💰
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                          <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="USER_BALANCE"
                        checked={paymentMethod === "USER_BALANCE"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-4 w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          💳
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Pay with User Balance</span>
                          <p className="text-sm text-gray-500">Use your account balance</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(0)}
                    className="flex-1 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    ← Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Review Order →
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 2: // Confirmation
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmation</h2>
              <p className="text-gray-600">Please review your order details before placing the order</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Details Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="mr-3 text-blue-500" />
                    Shipping Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FiHome className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Delivery Address</p>
                        <p className="text-gray-600">{address}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Phone Number</p>
                        <p className="text-gray-600">{phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiCreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Payment Method</p>
                        <p className="text-gray-600">
                          {paymentMethod === "COD" ? "💰 Cash on Delivery" : "💳 User Balance"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiShoppingCart className="mr-3 text-blue-500" />
                    Order Items ({cart?.items?.length || 0})
                  </h3>
                  {renderCartItems(cart?.items, true)}
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                {renderCartSummary()}
                
                <div className="mt-6 space-y-4">
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-lg disabled:opacity-50 disabled:transform-none"
                    disabled={isProcessingOrder || cartLoading}
                  >
                    {isProcessingOrder ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <FiCheckCircle className="inline mr-2" />
                        Place Order
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="w-full py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    disabled={isProcessingOrder}
                  >
                    ← Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Success
        return (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full mb-8">
              <FiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Order Placed Successfully! 🎉
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Thank you for your purchase! Your order has been confirmed and you'll receive updates on your delivery soon.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-green-800 mb-2">What's next?</h3>
              <ul className="text-green-700 text-left space-y-1">
                <li>• We'll send you an email confirmation</li>
                <li>• Your order will be prepared for shipping</li>
                <li>• You can track your order status anytime</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <FiShoppingCart className="mr-2" />
                Continue Shopping
              </Link>
              <Link 
                to="/orders" 
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <FiArrowRight className="mr-2" />
                Track Orders
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add animation styles for enhanced cart items
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.6s ease-out forwards;
    }
  `;

  // Only add the style if it doesn't exist
  if (!document.querySelector('style[data-cart-animations]')) {
    style.setAttribute('data-cart-animations', 'true');
    document.head.appendChild(style);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-900">
              {checkoutStep === 0 && "🛒 Shopping Cart"}
              {checkoutStep === 1 && "📍 Shipping & Payment"}
              {checkoutStep === 2 && "✅ Order Confirmation"}
              {checkoutStep === 3 && "🎉 Order Complete"}
            </h1>
          </div>
          
          {/* Progress Steps */}
          {checkoutStep < 3 && (
            <div className="flex items-center space-x-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              {[0, 1, 2].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      step <= checkoutStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step + 1}
                    </div>
                    <span className={`ml-3 font-medium ${
                      step <= checkoutStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step === 0 && "Cart"}
                      {step === 1 && "Shipping"}
                      {step === 2 && "Confirmation"}
                    </span>
                  </div>
                  {step < 2 && (
                    <div className={`flex-1 h-0.5 ${
                      step < checkoutStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        {renderCheckoutStepContent()}
      </div>
    </div>
  );
}