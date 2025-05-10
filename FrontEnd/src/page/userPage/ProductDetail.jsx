import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../lib/user/productServices";
import { formatCurrency } from "../../lib/utils";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const response = await getProductById(id);
        setProduct(response.result);
        setQuantity(1);
      } catch (error) {
        toast.error("Failed to load product details");
        navigate("/products");
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleLocalAddToCart = () => {
    if (!product) return;

    if (quantity > product.stock) {
      toast.warning(`Cannot add more than ${product.stock} items due to stock limitations.`);
      setQuantity(product.stock > 0 ? product.stock : 1);
      return;
    }
    if (product.stock <= 0){
        toast.error("This product is out of stock.");
        return;
    }
    
    addItem(product.id, quantity);
  };

  if (loadingProduct || cartLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600">Product not found</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-blue-500 hover:text-blue-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 min-h-[300px] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        <div className="p-6 md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-blue-600 mb-4">
              {formatCurrency(product.price)}
            </p>
            <div className="bg-gray-50 p-4 rounded mb-6">
              <h2 className="font-bold text-lg mb-2 text-gray-800">
                Product Details
              </h2>
              <p className="text-gray-700 mb-4 whitespace-pre-line">{product.description}</p>
              <p className="text-gray-700">
                <span className="font-semibold">Availability:</span>{" "}
                {product.stock > 0
                  ? <span className="text-green-600 font-semibold">In Stock ({product.stock} available)</span>
                  : <span className="text-red-600 font-semibold">Out of Stock</span>}
              </p>
            </div>
          </div>

          {product.stock > 0 ? (
            <div className="mt-auto">
              <div className="flex items-center mb-6">
                <span className="mr-4 font-semibold text-gray-700">Quantity:</span>
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-l-md focus:outline-none"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-800 border-l border-r border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-r-md focus:outline-none"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleLocalAddToCart}
                disabled={cartLoading || product.stock <= 0}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 transition-colors duration-150 ease-in-out"
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          ) : (
            <div className="mt-auto">
              <button
                disabled
                className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Out of Stock
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 