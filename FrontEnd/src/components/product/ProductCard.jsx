import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/utils";
import { 
  FiShoppingCart, 
  FiEye, 
  FiHeart, 
  FiStar, 
  FiChevronRight, 
  FiBarChart2, 
  FiBox 
} from "react-icons/fi";

export default function ProductCard({ product, addToCart }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Calculate discount percentage if there's an originalPrice
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
    
  // Mock rating for demo purposes - replace with actual product ratings when available
  const rating = product.rating || {
    value: Math.floor(Math.random() * 5) + 3.5, // Random rating between 3.5 and 5
    count: Math.floor(Math.random() * 500) + 10  // Random count between 10 and 500
  };

  return (
    <div 
      className="relative group bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        maxWidth: '320px',
        boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Favorite Button */}
      <button 
        className={`absolute z-10 right-3 top-3 p-2 rounded-full transition-all duration-300 ${
          isFavorite 
            ? 'bg-red-50 text-red-500' 
            : 'bg-white bg-opacity-80 text-gray-400 hover:text-red-500'
        }`}
        onClick={() => setIsFavorite(!isFavorite)}
      >
        <FiHeart 
          className={`transition-all ${isFavorite ? 'fill-current' : ''}`} 
        />
      </button>

      {/* Product badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {discountPercentage > 0 && (
          <div className="bg-red-500 text-white text-xs font-bold uppercase px-2 py-1 rounded-md">
            {discountPercentage}% Off
          </div>
        )}
        {product.isNew && (
          <div className="bg-green-500 text-white text-xs font-bold uppercase px-2 py-1 rounded-md">
            New
          </div>
        )}
        {product.isBestseller && (
          <div className="bg-amber-500 text-white text-xs font-bold uppercase px-2 py-1 rounded-md">
            Popular
          </div>
        )}
      </div>

      {/* Image container */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <FiBox className="text-gray-400 text-4xl" />
            </div>
          )}
        </div>

        {/* Second image on hover (if available) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {product.secondaryImageUrl ? (
            <img
              src={product.secondaryImageUrl}
              alt={`${product.name} - alternate view`}
              className="w-full h-full object-cover"
            />
          ) : product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <FiBox className="text-gray-400 text-4xl" />
            </div>
          )}
        </div>
        
        {/* Quick action buttons (visible on hover) */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent px-4 py-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-center space-x-2">
            <Link
              to={`/products/${product.id}`}
              className="bg-white bg-opacity-90 text-gray-800 hover:bg-blue-500 hover:text-white p-2 rounded-full transition-all duration-200 transform hover:scale-105"
              title="View details"
            >
              <FiEye />
            </Link>
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`p-2 rounded-full transition-all duration-200 transform hover:scale-105 ${
                product.stock > 0
                  ? "bg-white bg-opacity-90 text-gray-800 hover:bg-blue-500 hover:text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={product.stock > 0 ? "Add to cart" : "Out of stock"}
            >
              <FiShoppingCart />
            </button>
            {product.stock > 0 && (
              <div className="bg-white bg-opacity-90 text-green-500 p-2 rounded-full flex items-center justify-center">
                <FiBarChart2 title="In stock" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product information */}
      <div className="p-4">
        {/* Category & Brand */}
        <div className="mb-2 flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {product.category || "Uncategorized"}
          </span>
          {product.brand && (
            <span className="text-xs font-medium text-gray-700">{product.brand}</span>
          )}
        </div>
        
        {/* Product name */}
        <Link to={`/products/${product.id}`} className="block group-hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-lg mb-1 text-gray-800 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center mb-2">
          <div className="flex items-center text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar 
                key={star} 
                className={`w-3.5 h-3.5 ${rating.value >= star ? 'fill-current' : ''}`} 
              />
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-500">({rating.count})</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10 hover:line-clamp-none transition-all">
          {product.description}
        </p>

        {/* Price and CTA */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-gray-400 text-xs line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-blue-600 font-bold text-lg">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <div>
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${
                product.stock > 0
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? (
                <>
                  <FiShoppingCart className="mr-1" /> Add
                </>
              ) : (
                "Out of Stock"
              )}
            </button>
          </div>
        </div>

        {/* Inventory status */}
        {product.stock > 0 && (
          <div className="mt-2 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (product.stock / product.maxStock) * 100) || 50}%` 
                }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">{product.stock} left</span>
          </div>
        )}
      </div>

      {/* View details link */}
      <Link 
        to={`/products/${product.id}`}
        className="mt-2 border-t border-gray-100 py-3 px-4 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
      >
        View Details <FiChevronRight className="ml-1" />
      </Link>
    </div>
  );
}