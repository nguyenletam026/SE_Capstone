// layout/UserLayout.jsx

import React, { useState, useEffect } from "react";
import Header from "../header/Header";
import Footer from "../footer/userFooter";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

const UserLayout = ({ children }) => {
  const location = useLocation();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  // Update cart count whenever localStorage changes
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setCartItemsCount(count);
      } else {
        setCartItemsCount(0);
      }
    };
    
    // Initial count
    updateCartCount();
    
    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', updateCartCount);
    
    // Create a custom event listener for local updates
    const handleCartChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartChange);
    
    // Set up an interval to check for cart updates (as fallback)
    const interval = setInterval(updateCartCount, 2000);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', handleCartChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Fixed Header */}
      <Header cartItemsCount={cartItemsCount} />

      {/* Main Content - phải chừa padding-top cho header */}
      <main className="flex-grow w-full pt-16 bg-white">
        {children}
      </main>

      <Footer />
    </div>
  );
};

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserLayout;
