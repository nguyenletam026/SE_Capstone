import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/utils";

export default function ProductCard({ product, addToCart }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800 truncate">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-600 font-bold">
            {formatCurrency(product.price)}
          </span>
          <div className="space-x-2">
            <Link
              to={`/products/${product.id}`}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              View
            </Link>
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`px-3 py-1 rounded text-sm ${
                product.stock > 0
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 