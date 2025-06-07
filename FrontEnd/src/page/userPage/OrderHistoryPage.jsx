import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrdersAPI } from '../../lib/user/orderService';
import { formatCurrency, formatDate } from '../../lib/utils'; // Assuming formatDate is in utils
import { toast } from 'react-toastify';
import { List, Typography, Spin, Tag, Empty, Button, Descriptions } from 'antd'; // Using Ant Design for layout
import { ShoppingCartOutlined, EyeOutlined, HistoryOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const getStatusTagColor = (status) => {
  switch (status) {
    case 'PENDING_CONFIRMATION': return 'gold';
    case 'PREPARING': return 'processing';
    case 'SHIPPING': return 'blue';
    case 'DELIVERED': return 'cyan';
    case 'COMPLETED': return 'success';
    case 'CANCELLED': return 'error';
    default: return 'default';
  }
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getUserOrdersAPI();
        if (response.result) {
          setOrders(response.result);
        } else {
          toast.error(response.message || 'Failed to load orders.');
          setOrders([]);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error(error.message || 'Could not retrieve your orders.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" tip="Loading your orders..." />
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => setSelectedOrder(null)} 
          className="mb-6 pl-0"
        >
          Back to Order History
        </Button>
        <Title level={2} className="mb-6 text-center">Order Details</Title>
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Order ID">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="Order Date">{formatDate(selectedOrder.orderDate)}</Descriptions.Item>
            <Descriptions.Item label="Total Amount">{formatCurrency(selectedOrder.totalAmount)}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusTagColor(selectedOrder.status)}>
                {selectedOrder.status.replace('_', ' ')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method" span={2}>{selectedOrder.paymentMethod === "COD" ? "Cash on Delivery" : "User Balance"}</Descriptions.Item>
            <Descriptions.Item label="Shipping Address" span={2}>{selectedOrder.address}</Descriptions.Item>
            <Descriptions.Item label="Phone Number" span={2}>{selectedOrder.phoneNumber}</Descriptions.Item>
          </Descriptions>

          <Title level={4} className="mt-8 mb-4">Items Ordered</Title>
          <List
            itemLayout="horizontal"
            dataSource={selectedOrder.items}
            renderItem={item => (
              <List.Item className="border-b last:border-b-0 py-4">
                <List.Item.Meta
                  avatar={item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded" /> : <ShoppingCartOutlined className="text-2xl text-gray-400"/>}
                  title={<Text strong>{item.productName}</Text>}
                  description={`Quantity: ${item.quantity} - Price: ${formatCurrency(item.price)}`}
                />
                <div className="font-semibold">{formatCurrency(item.subtotal)}</div>
              </List.Item>
            )}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      <Title level={2} className="mb-8 text-center flex items-center justify-center">
        <HistoryOutlined className="mr-3" /> Your Order History
      </Title>
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <Empty
            image={<ShoppingCartOutlined style={{ fontSize: '60px', color: '#bfbfbf' }} />}
            description={
              <Paragraph className="text-gray-600">
                You haven't placed any orders yet.
              </Paragraph>
            }
          >
            <Link to="/products">
              <Button type="primary" icon={<ShoppingOutlined />}>Start Shopping</Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={orders}
          renderItem={order => (
            <List.Item
              key={order.id}
              className="bg-white p-6 mb-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200"
              actions={[
                <Button 
                  type="primary" 
                  ghost 
                  icon={<EyeOutlined />} 
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </Button>
              ]}
            >
              <List.Item.Meta
                title={<Text strong className="text-lg">Order ID: {order.id}</Text>}
                description={`Placed on: ${formatDate(order.orderDate)}`}
              />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Text strong>Total Amount: </Text>
                  <Text className="text-blue-600 font-semibold">{formatCurrency(order.totalAmount)}</Text>
                </div>
                <div>
                  <Text strong>Status: </Text>
                  <Tag color={getStatusTagColor(order.status)} className="font-medium">
                    {order.status.replace('_', ' ')}
                  </Tag>
                </div>
                 <div>
                  <Text strong>Items: </Text>
                  <Text>{order.items.length}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </motion.div>
  );
}

// Helper function in utils.js (ensure this exists or adapt)
/*
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
*/ 