import React, { useState, useEffect } from "react";
import { getAllProducts, searchProducts } from "../../lib/user/productServices";
import ProductCard from "../../components/product/ProductCard";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { 
  FiShoppingCart, 
  FiSearch, 
  FiGrid, 
  FiList, 
  FiFilter,
  FiTrendingUp,
  FiStar,
  FiHeart,
  FiZap,
  FiTag,
  FiPackage,
  FiEye,
  FiArrowRight,
  FiShoppingBag,
  FiGift,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiX,
  FiChevronDown,
  FiSliders
} from "react-icons/fi";

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 25,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { cart, addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await getAllProducts();
        setProducts(response.result || []);
      } catch (error) {
        toast.error("Tải sản phẩm thất bại");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      const response = await getAllProducts();
      setProducts(response.result || []);
      return;
    }
    try {
      setLoadingProducts(true);
      const response = await searchProducts(searchTerm);
      setProducts(response.result || []);
      if (!response.result || response.result.length === 0) {
        toast.info(`Không tìm thấy sản phẩm nào cho "${searchTerm}"`);
      }
    } catch (error) {
      toast.error("Tìm kiếm sản phẩm thất bại");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock < 1) {
      toast.warn("Sản phẩm này đã hết hàng.");
      return;
    }
    addItem(product.id, 1);
  };

  const goToCart = () => {
    navigate("/cart");
  };

  const totalCartItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl"
        />
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-rose-300/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">        {/* Hero Header Section */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50"
        >
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
              {/* Title Section */}
              <div className="text-center lg:text-left">
                <motion.h1 
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Khám Phá
                  </span>
                  <br />
                  <span className="text-slate-800">Sản Phẩm Tuyệt Vời</span>
                </motion.h1>
                <motion.p 
                  className="text-slate-600 text-sm sm:text-base lg:text-lg"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Tìm kiếm những sản phẩm chất lượng cao với giá tốt nhất
                </motion.p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto justify-center lg:justify-end">
                {/* View Mode Toggle */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 sm:p-2 border border-gray-200/50 shadow-lg">
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {viewMode === 'grid' ? <FiGrid size={16} className="sm:w-5 sm:h-5" /> : <FiList size={16} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>

                {/* Filter Toggle */}
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSliders size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline text-sm sm:text-base">Bộ lọc</span>
                  <span className="sm:hidden text-sm">Lọc</span>
                </motion.button>

                {/* Cart Button */}
                <motion.button
                  onClick={goToCart}
                  className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiShoppingCart size={20} className="sm:w-6 sm:h-6" />
                  <AnimatePresence>
                    {totalCartItems > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full shadow-lg"
                      >
                        {totalCartItems > 99 ? '99+' : totalCartItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">          {/* Enhanced Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8 sm:mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <div className={`relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border transition-all duration-300 ${
                searchFocused ? 'border-indigo-300 shadow-indigo-200/50' : 'border-gray-200/50'
              }`}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                  <div className="flex-1 relative">                    <FiSearch className={`absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-300 sm:w-6 sm:h-6 ${
                      searchFocused ? 'text-indigo-500' : 'text-gray-400'
                    }`} size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Tìm kiếm sản phẩm hoàn hảo cho bạn..."
                      className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6 text-base sm:text-lg text-slate-700 placeholder-gray-400 bg-transparent focus:outline-none"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  
                  {searchTerm && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => setSearchTerm("")}
                      className="absolute right-24 sm:right-32 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX className="sm:w-5 sm:h-5" size={16} />
                    </motion.button>
                  )}

                  <motion.button
                    onClick={handleSearch}
                    disabled={loadingProducts}
                    className="m-2 px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loadingProducts ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm sm:text-base">Đang tìm...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiSearch className="sm:w-5 sm:h-5" size={16} />
                        <span className="text-sm sm:text-base">Tìm kiếm</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 sm:mb-12 overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-xl border border-gray-200/50">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800">Bộ lọc:</h3>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:border-indigo-300 focus:outline-none transition-all duration-300"
                      >
                        <option value="all">Tất cả danh mục</option>
                        <option value="electronics">Điện tử</option>
                        <option value="fashion">Thời trang</option>
                        <option value="home">Gia dụng</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                      <span className="text-slate-600">Sắp xếp:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:border-indigo-300 focus:outline-none transition-all duration-300"
                      >
                        <option value="name">Tên A-Z</option>
                        <option value="price-low">Giá thấp đến cao</option>
                        <option value="price-high">Giá cao đến thấp</option>
                        <option value="rating">Đánh giá cao nhất</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowFilters(false)}
                      className="self-end lg:self-auto p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 sm:mb-12"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[
                { icon: FiPackage, label: 'Sản phẩm', value: products.length, color: 'from-blue-500 to-cyan-500' },
                { icon: FiTruck, label: 'Miễn phí ship', value: '2-5 ngày', color: 'from-green-500 to-emerald-500' },
                { icon: FiShield, label: 'Bảo hành', value: '12 tháng', color: 'from-purple-500 to-pink-500' },
                { icon: FiGift, label: 'Ưu đãi', value: 'Hấp dẫn', color: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-200/50 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-r ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center text-white`}>
                    <stat.icon size={16} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Products Section */}
          <AnimatePresence mode="wait">
            {loadingProducts || cartLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center items-center py-24"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{animationDelay: '0.1s'}}></div>
                  <div className="absolute top-4 left-4 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{animationDelay: '0.2s'}}></div>
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Đang tải sản phẩm...</h3>
                  <p className="text-slate-600">Vui lòng chờ trong giây lát</p>
                </div>
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div
                key="no-products"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6 }}
                className="text-center py-24"
              >
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                    <FiPackage size={48} className="text-gray-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-4">Không tìm thấy sản phẩm</h3>
                  <p className="text-xl text-slate-600 mb-8">
                    Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại sau nhé.
                  </p>
                  <motion.button
                    onClick={() => {
                      setSearchTerm("");
                      handleSearch();
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiRefreshCw className="inline mr-2" />
                    Tải lại tất cả sản phẩm
                  </motion.button>
                </div>
              </motion.div>
            ) : (              <motion.div
                key="product-grid"
                className={`grid gap-4 sm:gap-6 lg:gap-8 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
                }`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {products.map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    variants={itemVariants}
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ProductCard
                      product={product}
                      addToCart={handleAddToCart}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Call to Action Section */}
          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-20 text-center"
            >
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div className="relative z-10">
                  <motion.h2 
                    className="text-4xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    Không tìm thấy sản phẩm ưng ý?
                  </motion.h2>
                  <motion.p 
                    className="text-xl mb-8 opacity-90"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
                  </motion.p>
                  <motion.button
                    className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    Liên hệ ngay
                    <FiArrowRight className="inline ml-2" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}