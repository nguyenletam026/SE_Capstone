import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../lib/user/productServices";
import { formatCurrency } from "../../lib/utils";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
import { 
  FiArrowLeft, 
  FiHeart,
  FiShare2,
  FiStar,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiCheckCircle,
  FiBox,
  FiZoomIn,
  FiEye,
  FiPackage
} from "react-icons/fi";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
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
  const handleLocalAddToCart = async () => {
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
    
    setIsAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${quantity} item(s) to cart! 🛒`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites ❤️");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

    // Loading state with modern spinner
  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading Product Details...
          </h3>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Please wait while we fetch the information</p>
        </motion.div>
      </div>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-6 sm:p-12 rounded-2xl shadow-xl max-w-md mx-4 w-full"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FiBox className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">The product you're looking for doesn't exist or has been removed.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/products")}
            className="px-6 sm:px-8 py-2 sm:py-3 min-h-[44px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            <FiArrowLeft className="inline mr-2" />
            Back to Products
          </motion.button>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-8 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-48 h-48 sm:w-80 sm:h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Navigation Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 min-h-[44px]"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
            <span className="font-medium text-gray-700 group-hover:text-gray-800 text-sm sm:text-base">Back</span>
          </motion.button>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 sm:p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 group min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteToggle}
              className={`p-2 sm:p-3 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isFavorite 
                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' 
                  : 'bg-white/80 text-gray-600 hover:text-red-500'
              }`}
            >
              <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Product Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/50"
        >
          <div className="lg:flex">
            {/* Product Image Section */}
            <div className="lg:w-1/2 relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden"
              >
                {product.imageUrl ? (
                  <motion.img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px] object-cover transition-transform duration-700"
                    whileHover={{ scale: 1.05 }}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <FiPackage className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                      <span className="text-gray-500 text-base sm:text-lg">No image available</span>
                    </div>
                  </div>
                )}
                
                {/* Image Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setImageZoom(true)}
                    className="p-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <FiZoomIn className="w-6 h-6 text-gray-700" />
                  </motion.button>
                </div>                {/* Stock Badge */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                  {product.stock > 0 ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/30"
                    >
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-semibold text-xs sm:text-sm">In Stock</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/30"
                    >
                      <span className="font-semibold text-xs sm:text-sm">Out of Stock</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>            {/* Product Information Section */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Product Title & Rating */}
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                    {product.name}
                  </h1>
                  
                  {/* Mock Rating */}
                  <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm sm:text-base">(4.0)</span>
                    <span className="text-gray-400 text-sm sm:text-base">•</span>
                    <span className="text-gray-600 text-sm sm:text-base">128 reviews</span>
                  </div>

                  {/* Price */}
                  <div className="mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-gray-500 text-base sm:text-lg line-through mt-1">
                      {formatCurrency(product.price * 1.2)}
                    </div>
                  </div>
                </div>                {/* Product Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 sm:mb-8"
                >
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Product Description</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200/50">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {product.description}
                    </p>
                  </div>
                </motion.div>

                {/* Stock Information */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 sm:mb-8"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Availability</span>
                    <div className="flex items-center space-x-2">
                      <FiPackage className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      <span className={`font-semibold text-sm sm:text-base ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                  
                  {product.stock > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 sm:mb-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <FiTruck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-blue-700">Free Shipping</span>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <FiShield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-green-700">2 Year Warranty</span>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <FiRefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-purple-700">Easy Returns</span>
                    </div>
                  </div>
                </motion.div>                {/* Quantity & Add to Cart */}
                {product.stock > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Quantity Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Quantity
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                            disabled={isAddingToCart}
                          >
                            <FiMinus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </motion.button>
                          <div className="px-4 sm:px-6 py-2 sm:py-3 font-bold text-base sm:text-lg text-gray-800 border-x border-gray-200 min-w-[60px] sm:min-w-[80px] text-center">
                            {quantity}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                            disabled={isAddingToCart || quantity >= product.stock}
                          >
                            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </motion.button>
                        </div>
                        <span className="text-gray-500 text-sm sm:text-base">
                          Max: {product.stock}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLocalAddToCart}
                      disabled={isAddingToCart || cartLoading}
                      className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">Adding to Cart...</span>
                        </>
                      ) : (
                        <>
                          <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">Add to Cart • {formatCurrency(product.price * quantity)}</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                  >
                    <button
                      disabled
                      className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold text-base sm:text-lg rounded-xl cursor-not-allowed opacity-75"
                    >
                      Out of Stock
                    </button>
                    <p className="text-gray-500 mt-3 text-sm sm:text-base">
                      This product is currently unavailable
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}