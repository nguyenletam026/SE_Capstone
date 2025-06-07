import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShoppingCart, 
  FiEye, 
  FiHeart, 
  FiStar, 
  FiChevronRight, 
  FiBox,
  FiZap,
  FiTrendingUp,
  FiShield,
  FiAward,
  FiGift,
  FiPercent
} from "react-icons/fi";

export default function ProductCard({ product, addToCart, viewMode = "grid" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Enhanced product features
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
    
  const rating = product.rating || {
    value: (Math.random() * 1.5 + 3.5).toFixed(1),
    count: Math.floor(Math.random() * 500) + 10
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  // List view for larger screens
  if (viewMode === "list") {
    return (
      <motion.div
        className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50"
        whileHover={{ y: -5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >        <div className="flex">          {/* Image Section - Enhanced Larger for List View */}
          <div className="relative w-56 h-56 sm:w-60 sm:h-60 lg:w-64 lg:h-64 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
            {/* Badges */}
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
              {discountPercentage > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center"
                >
                  <FiPercent className="mr-1" />
                  -{discountPercentage}%
                </motion.div>
              )}
              {product.isNew && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  MỚI
                </div>
              )}
            </div>

            {/* Favorite Button */}
            <button 
              className={`absolute right-3 top-3 z-10 p-2 rounded-full transition-all duration-300 ${
                isFavorite 
                  ? 'bg-pink-100 text-pink-500 scale-110' 
                  : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-pink-50'
              }`}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <FiHeart className={`transition-all ${isFavorite ? 'fill-current' : ''}`} />
            </button>            {/* Product Image - Enhanced */}
            <div className="absolute inset-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`w-full h-full object-cover object-center transition-transform duration-700 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  }`}
                  style={{ imageRendering: 'crisp-edges' }}
                  loading="lazy"
                />              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiBox className="text-slate-400 text-6xl" />
                </div>
              )}
            </div>

            {/* Overlay on hover */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
                <Link
                  to={`/products/${product.id}`}
                  className="bg-white/90 text-slate-800 hover:bg-indigo-500 hover:text-white p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <FiEye />
                </Link>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || isAdding}
                  className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                    product.stock > 0
                      ? "bg-white/90 text-slate-800 hover:bg-emerald-500 hover:text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isAdding ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    <FiShoppingCart />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">
                  {product.category || "Sức khỏe"}
                </p>
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-bold text-xl text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
              </div>
              
              <div className="text-right">
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through block">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-3">
              <div className="flex items-center text-amber-400 mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar 
                    key={star} 
                    className={`w-4 h-4 ${rating.value >= star ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {rating.value} ({rating.count} đánh giá)
              </span>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {product.stock > 0 ? (
                  <div className="flex items-center text-emerald-600">
                    <FiShield className="mr-1" />
                    <span className="text-sm font-medium">Còn {product.stock} sản phẩm</span>
                  </div>
                ) : (
                  <span className="text-red-500 text-sm font-medium">Hết hàng</span>
                )}
              </div>

              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAdding}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                  product.stock > 0
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isAdding ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Đang thêm...
                  </div>
                ) : product.stock > 0 ? (
                  "Thêm vào giỏ"
                ) : (
                  "Hết hàng"
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  // Grid view (default) - Enhanced for larger images
  return (
    <motion.div
      className="group relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50"
      style={{ maxWidth: '420px' }}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Badges */}
      <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
        {discountPercentage > 0 && (
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center"
          >
            <FiPercent className="mr-1" />
            GIẢM {discountPercentage}%
          </motion.div>
        )}
        {product.isNew && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
            <FiZap className="mr-1" />
            HOT
          </div>
        )}
        {product.isBestseller && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
            <FiAward className="mr-1" />
            BÁN CHẠY
          </div>
        )}
      </div>

      {/* Enhanced Favorite Button */}
      <motion.button 
        className={`absolute right-4 top-4 z-20 p-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
          isFavorite 
            ? 'bg-pink-100/90 text-pink-500 scale-110 shadow-lg' 
            : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-pink-50/90 hover:scale-110'
        }`}
        onClick={() => setIsFavorite(!isFavorite)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiHeart className={`transition-all ${isFavorite ? 'fill-current' : ''}`} />
      </motion.button>      {/* Enhanced Image Container - Larger and More Full */}
      <div className="relative h-80 sm:h-72 lg:h-80 xl:h-96 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {/* Primary Image */}
        <motion.div 
          className="absolute inset-0"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              style={{ imageRendering: 'crisp-edges' }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiBox className="text-slate-400 text-6xl" />
            </div>
          )}
        </motion.div>

        {/* Gradient Overlay on Hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Quick Action Buttons */}
        <motion.div 
          className="absolute bottom-4 left-4 right-4 flex justify-center space-x-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: isHovered ? 0 : 20, 
            opacity: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to={`/products/${product.id}`}
            className="bg-white/90 backdrop-blur-sm text-slate-800 hover:bg-indigo-500 hover:text-white p-3 rounded-xl transition-all duration-200 shadow-lg"
          >
            <FiEye className="text-lg" />
          </Link>
          <motion.button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding}
            className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm shadow-lg ${
              product.stock > 0
                ? "bg-white/90 text-slate-800 hover:bg-emerald-500 hover:text-white"
                : "bg-gray-200/80 text-gray-400 cursor-not-allowed"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
            ) : (
              <FiShoppingCart className="text-lg" />
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Enhanced Product Information */}
      <div className="p-6">
        {/* Category & Brand */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wide">
            {product.category || "Sức khỏe"}
          </span>
          {product.brand && (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
              {product.brand}
            </span>
          )}
        </div>
        
        {/* Product Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-3 group-hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>

        {/* Enhanced Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex items-center text-amber-400 mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar 
                  key={star} 
                  className={`w-4 h-4 ${rating.value >= star ? 'fill-current' : ''}`} 
                />
              ))}
            </div>
            <span className="text-sm text-slate-600 font-medium">
              {rating.value}
            </span>
          </div>
          <span className="text-xs text-slate-500">({rating.count})</span>
        </div>
        
        {/* Description */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Enhanced Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through block">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          {/* Enhanced Stock Indicator */}
          <div className="text-right">
            {product.stock > 0 ? (
              <div className="flex items-center text-emerald-600">
                <FiShield className="mr-1 text-sm" />
                <span className="text-xs font-medium">Còn hàng</span>
              </div>
            ) : (
              <span className="text-red-500 text-xs font-medium">Hết hàng</span>
            )}
          </div>
        </div>

        {/* Enhanced Stock Progress Bar */}
        {product.stock > 0 && (
          <div className="mb-4">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (product.stock / (product.maxStock || 100)) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Còn lại {product.stock} sản phẩm</p>
          </div>
        )}

        {/* Enhanced CTA Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAdding}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
            product.stock > 0
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
          whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
        >
          {isAdding ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
              Đang thêm...
            </div>
          ) : product.stock > 0 ? (
            <div className="flex items-center">
              <FiShoppingCart className="mr-2" />
              Thêm vào giỏ
            </div>
          ) : (
            "Hết hàng"
          )}
        </motion.button>
      </div>

      {/* Enhanced View Details Link */}
      <Link 
        to={`/products/${product.id}`}
        className="block border-t border-slate-200/50 py-3 px-6 text-center text-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium group"
      >
        <span className="flex items-center justify-center">
          Xem chi tiết 
          <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.div>
  );
}