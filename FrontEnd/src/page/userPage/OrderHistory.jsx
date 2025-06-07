import React, { useState, useEffect } from "react";
import { getUserOrders, getOrderById } from "../../lib/user/productServices";
import { formatCurrency } from "../../lib/utils";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimateHeight from "react-animate-height";
import { 
  HistoryOutlined, 
  ShoppingOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  TagOutlined,
  DownOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  UpOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getUserOrders();
        setOrders(response.result || []);
      } catch (error) {
        toast.error("Failed to load order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = async (orderId) => {
    // If already expanded, collapse it
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    try {
      // Get detailed order information
      const response = await getOrderById(orderId);
      
      // Update orders array with detailed information
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? response.result : order
        )
      );
      
      // Expand this order
      setExpandedOrder(orderId);
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  // Status badge component with appropriate colors based on actual order status
  const OrderStatusBadge = ({ status }) => {
    let displayText, color, icon;
    
    switch (status) {
      case 'PENDING_CONFIRMATION':
        displayText = "Pending Confirmation";
        color = "bg-yellow-100 text-yellow-800";
        icon = <ClockCircleOutlined />;
        break;
      case 'PREPARING':
        displayText = "Preparing";
        color = "bg-orange-100 text-orange-800";
        icon = <ClockCircleOutlined />;
        break;
      case 'SHIPPING':
        displayText = "Shipping";
        color = "bg-blue-100 text-blue-800";
        icon = <ShoppingOutlined />;
        break;
      case 'DELIVERED':
        displayText = "Delivered";
        color = "bg-green-100 text-green-800";
        icon = <TagOutlined />;
        break;
      case 'COMPLETED':
        displayText = "Completed";
        color = "bg-green-100 text-green-800";
        icon = <TagOutlined />;
        break;
      case 'CANCELLED':
        displayText = "Cancelled";
        color = "bg-red-100 text-red-800";
        icon = <CloseCircleOutlined />;
        break;
      default:
        displayText = "Processing";
        color = "bg-yellow-100 text-yellow-800";
        icon = <ClockCircleOutlined />;
    }
    
    return (
      <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <span className="mr-1">{icon}</span> {displayText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center px-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl"
      >
        <div className="text-center mb-8 sm:mb-16">
          <HistoryOutlined style={{ fontSize: '32px', color: '#3b82f6' }} className="sm:text-5xl" />
          <h1 className="text-2xl sm:text-3xl font-bold mt-4 mb-2 text-gray-800">
            Order History
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Track all your purchases in one place</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 text-center">
          <InboxOutlined style={{ fontSize: '60px', color: '#d1d5db' }} className="sm:text-8xl" />
          <h2 className="text-xl sm:text-2xl font-bold mt-4 sm:mt-6 mb-3 sm:mb-4 text-gray-800">No Orders Yet</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping and your order history will appear here.
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 min-h-[44px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <ShoppingOutlined className="mr-2" />
            Start Shopping
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl"
    >
      <div className="text-center mb-8 sm:mb-12">
        <HistoryOutlined style={{ fontSize: '32px', color: '#3b82f6' }} className="sm:text-5xl" />
        <h1 className="text-2xl sm:text-3xl font-bold mt-4 mb-2 text-gray-800">
          Order History
        </h1>
        <p className="text-sm sm:text-base text-gray-600">Track all your purchases in one place</p>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div
              className={`p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors min-h-[44px] ${expandedOrder === order.id ? 'bg-gray-50' : ''}`}
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-2 gap-2 sm:gap-3">
                    <h3 className="font-bold text-base sm:text-lg text-gray-800">
                      <FileTextOutlined className="mr-2" />
                      Order #{order.id.substring(0, 8)}...
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                    <CalendarOutlined className="mr-2" />
                    Placed on {formatDate(order.orderDate)}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mr-4 mb-2 sm:mb-0">
                    <p className="font-semibold text-xs sm:text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-blue-600 text-lg sm:text-xl">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <div className="text-blue-600 self-end sm:self-center">
                    {expandedOrder === order.id ? <UpOutlined /> : <DownOutlined />}
                  </div>
                </div>
              </div>
            </div>

            <AnimateHeight
              duration={300}
              height={expandedOrder === order.id ? "auto" : 0}
            >
              <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
                {order.items && order.items.length > 0 ? (
                  <>
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                      <ShoppingOutlined className="mr-2" /> Order Items
                    </h4>
                    <div className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="py-3 sm:py-4 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0"
                        >
                          <div className="flex">
                            {item.productImageUrl && (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden mr-3 sm:mr-4 border border-gray-200 flex-shrink-0">
                                <img
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base truncate">
                                {item.productName}
                              </h5>
                              <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 text-xs sm:text-sm gap-1 sm:gap-0">
                                <span className="mr-0 sm:mr-2">{formatCurrency(item.price)}</span>
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-1 sm:mr-2">×</span> 
                                  <span className="inline-flex items-center justify-center min-w-[24px] h-5 sm:h-6 bg-gray-200 text-gray-700 text-xs font-medium rounded-full px-2">
                                    {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-gray-800 text-sm sm:text-base flex items-center sm:ml-4">
                            <CreditCardOutlined className="mr-2 text-blue-500" />
                            {formatCurrency(item.subtotal)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                      <span className="font-bold text-gray-800 flex items-center text-sm sm:text-base">
                        <TagOutlined className="mr-2" /> Total:
                      </span>
                      <span className="font-bold text-blue-600 text-lg sm:text-xl">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm sm:text-base">Loading order details...</p>
                  </div>
                )}
              </div>
            </AnimateHeight>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center mt-8 sm:mt-10 px-4">
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 min-h-[44px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
        >
          <ShoppingCartOutlined className="mr-2" /> Continue Shopping
        </Link>
      </div>
    </motion.div>
  );
}