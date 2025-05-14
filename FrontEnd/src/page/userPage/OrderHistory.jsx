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
  CreditCardOutlined
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

  // Status badge component with appropriate colors
  const OrderStatusBadge = ({ orderDate }) => {
    const date = new Date(orderDate);
    const now = new Date();
    const daysDifference = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    let status, color, icon;
    
    if (daysDifference < 1) {
      status = "Processing";
      color = "bg-yellow-100 text-yellow-800";
      icon = <ClockCircleOutlined />;
    } else if (daysDifference < 3) {
      status = "Shipped";
      color = "bg-blue-100 text-blue-800";
      icon = <ShoppingOutlined />;
    } else {
      status = "Delivered";
      color = "bg-green-100 text-green-800";
      icon = <TagOutlined />;
    }
    
    return (
      <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <span className="mr-1">{icon}</span> {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12 max-w-4xl"
      >
        <div className="text-center mb-16">
          <HistoryOutlined style={{ fontSize: '48px', color: '#3b82f6' }} />
          <h1 className="text-3xl font-bold mt-4 mb-2 text-gray-800">
            Order History
          </h1>
          <p className="text-gray-600">Track all your purchases in one place</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <InboxOutlined style={{ fontSize: '80px', color: '#d1d5db' }} />
          <h2 className="text-2xl font-bold mt-6 mb-4 text-gray-800">No Orders Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping and your order history will appear here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShoppingCartOutlined className="mr-2" /> Browse Products
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 max-w-4xl"
    >
      <div className="text-center mb-12">
        <HistoryOutlined style={{ fontSize: '48px', color: '#3b82f6' }} />
        <h1 className="text-3xl font-bold mt-4 mb-2 text-gray-800">
          Order History
        </h1>
        <p className="text-gray-600">Track all your purchases in one place</p>
      </div>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div
              className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${expandedOrder === order.id ? 'bg-gray-50' : ''}`}
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <h3 className="font-bold text-lg text-gray-800 mr-3">
                      <FileTextOutlined className="mr-2" />
                      Order #{order.id.substring(0, 8)}...
                    </h3>
                    <OrderStatusBadge orderDate={order.orderDate} />
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <CalendarOutlined className="mr-2" />
                    Placed on {formatDate(order.orderDate)}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4">
                    <p className="font-semibold text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-blue-600 text-xl">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <div className="text-blue-600">
                    {expandedOrder === order.id ? <UpOutlined /> : <DownOutlined />}
                  </div>
                </div>
              </div>
            </div>

            <AnimateHeight
              duration={300}
              height={expandedOrder === order.id ? "auto" : 0}
            >
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                {order.items && order.items.length > 0 ? (
                  <>
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <ShoppingOutlined className="mr-2" /> Order Items
                    </h4>
                    <div className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="py-4 flex flex-col sm:flex-row justify-between"
                        >
                          <div className="flex">
                            {item.productImageUrl && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 border border-gray-200">
                                <img
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-1">
                                {item.productName}
                              </h5>
                              <div className="flex items-center text-gray-600">
                                <span className="mr-2">{formatCurrency(item.price)}</span>
                                <span className="text-gray-400">×</span> 
                                <span className="ml-2 inline-flex items-center justify-center min-w-[24px] h-6 bg-gray-200 text-gray-700 text-xs font-medium rounded-full px-2">
                                  {item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold text-gray-800 mt-4 sm:mt-0 flex items-center">
                            <CreditCardOutlined className="mr-2 text-blue-500" />
                            {formatCurrency(item.subtotal)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
                      <span className="font-bold text-gray-800 flex items-center">
                        <TagOutlined className="mr-2" /> Total:
                      </span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading order details...</p>
                  </div>
                )}
              </div>
            </AnimateHeight>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center mt-10">
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCartOutlined className="mr-2" /> Continue Shopping
        </Link>
      </div>
    </motion.div>
  );
} 