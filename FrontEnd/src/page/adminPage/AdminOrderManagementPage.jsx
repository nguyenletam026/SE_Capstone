import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Select, Button, Spin, Typography, Modal, Descriptions, List, message, Space, DatePicker, Card, Row, Col, Statistic } from 'antd';
import { getAllOrdersAdminAPI, updateOrderStatusAdminAPI } from '../../lib/admin/orderService';
import { formatCurrency, formatDate } from '../../lib/utils'; // Assuming formatDate is in utils
import { toast } from 'react-toastify';
import { EyeOutlined, ShoppingCartOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, HistoryOutlined, FilterOutlined, CalendarOutlined, DollarOutlined, TableOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ORDER_STATUSES = [
  'PENDING_CONFIRMATION',
  'PREPARING',
  'SHIPPING',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED'
];

const STATUS_FLOW = {
  'PENDING_CONFIRMATION': ['PREPARING', 'CANCELLED'],
  'PREPARING': ['SHIPPING', 'CANCELLED'],
  'SHIPPING': ['DELIVERED', 'CANCELLED'],
  'DELIVERED': ['COMPLETED'],
  'COMPLETED': [],
  'CANCELLED': []
};

const getValidNextStatuses = (currentStatus) => {
  return STATUS_FLOW[currentStatus] || [];
};

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

export default function AdminOrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  const [dateRange, setDateRange] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllOrdersAdminAPI();
      if (response.result) {
        setOrders(response.result);
        setFilteredOrders(response.result);
      } else {
        toast.error(response.message || 'Failed to load orders.');
      }
    } catch (error) {
      console.error("Failed to fetch orders for admin:", error);
      toast.error(error.message || 'Could not retrieve orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  useEffect(() => {
    let filtered = orders;
    if (dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(order => {
        const orderDate = moment(order.orderDate);
        return orderDate.isSameOrAfter(startDate.startOf('day')) && 
               orderDate.isSameOrBefore(endDate.endOf('day'));
      });
    }
    if (selectedPaymentMethod !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === selectedPaymentMethod);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    setFilteredOrders(filtered);
  }, [orders, dateRange, selectedPaymentMethod, selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const validNextStatuses = getValidNextStatuses(order.status);
    if (!validNextStatuses.includes(newStatus)) {
      toast.error(`Cannot change status from ${order.status.replace('_', ' ')} to ${newStatus.replace('_', ' ')}. Please follow the sequential order.`);
      return;
    }
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await updateOrderStatusAdminAPI(orderId, newStatus);
      if (response.result) {
        toast.success(`Order ${orderId.substring(0, 8)}... status updated to ${newStatus.replace('_', ' ')}.`);
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      } else {
        toast.error(response.message || 'Failed to update order status.');
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error.message || 'Could not update status.');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const showOrderDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const clearFilters = () => {
    setDateRange([]);
    setSelectedPaymentMethod('all');
    setSelectedStatus('all');
  };

  const getOrderStatistics = () => {
    const total = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const statusCounts = ORDER_STATUSES.reduce((acc, status) => {
      acc[status] = filteredOrders.filter(order => order.status === status).length;
      return acc;
    }, {});
    return { total, totalRevenue, statusCounts };
  };

  const statistics = getOrderStatistics();

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text copyable ellipsis={{ tooltip: text }}>{text.substring(0, 8)}...</Text>,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      filters: [
        { text: 'COD', value: 'COD' },
        { text: 'User Balance', value: 'USER_BALANCE' },
      ],
      onFilter: (value, record) => record.paymentMethod.includes(value),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const validNextStatuses = getValidNextStatuses(status);
        const canUpdate = validNextStatuses.length > 0;
        return (
          <Space direction="vertical" size="small">
            <Tag color={getStatusTagColor(status)} style={{marginRight: 0}}>
              {status.replace('_', ' ')}
            </Tag>
            {canUpdate && (
              <Select
                placeholder="Update to..."
                style={{ width: 160 }}
                onChange={(value) => handleStatusChange(record.id, value)}
                loading={updatingStatus[record.id]}
                disabled={updatingStatus[record.id]}
                allowClear
              >
                {validNextStatuses.map(s => (
                  <Select.Option key={s} value={s}>
                    <Tag color={getStatusTagColor(s)} style={{marginRight: 0}}>
                      {s.replace('_', ' ')}
                    </Tag>
                  </Select.Option>
                ))}
              </Select>
            )}
          </Space>
        );
      },
      filters: ORDER_STATUSES.map(s => ({ text: s.replace('_', ' '), value: s })),
      onFilter: (value, record) => record.status.includes(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
            <Button 
                type="link" 
                icon={<EyeOutlined />} 
                onClick={() => showOrderDetailModal(record)}
            >
                Details
            </Button>
        </Space>
      ),
    },
  ];

  if (loading && !orders.length) { // Show initial loading spinner only if there are no orders yet
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Spin size="large" tip="Loading orders..." />
      </div>
    );
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
    >
      <Title level={2} className="mb-8 text-center flex items-center justify-center">
        <HistoryOutlined className="mr-3" /> Admin - Order Management
      </Title>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="transition-shadow hover:shadow-lg">
            <Statistic 
              title="Total Orders" 
              value={statistics.total} 
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="transition-shadow hover:shadow-lg">
            <Statistic 
              title="Total Revenue" 
              value={statistics.totalRevenue} 
              precision={0}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="transition-shadow hover:shadow-lg">
            <Statistic 
              title="Pending" 
              value={statistics.statusCounts.PENDING_CONFIRMATION} 
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable className="transition-shadow hover:shadow-lg">
            <Statistic 
              title="Completed" 
              value={statistics.statusCounts.COMPLETED} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
        <Title level={4} className="flex items-center mb-4">
          <FilterOutlined className="mr-2" /> Filters
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div className="mb-4 sm:mb-0">
              <Text strong className="block mb-2">
                <CalendarOutlined className="mr-1" /> Date Range
              </Text>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="mb-4 sm:mb-0">
              <Text strong className="block mb-2">Payment Method</Text>
              <Select
                style={{ width: '100%' }}
                value={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                placeholder="Select payment method"
              >
                <Select.Option value="all">All Payment Methods</Select.Option>
                <Select.Option value="COD">Cash on Delivery</Select.Option>
                <Select.Option value="USER_BALANCE">User Balance</Select.Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong className="block mb-2">Order Status</Text>
              <Select
                style={{ width: '100%' }}
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Select status"
              >
                <Select.Option value="all">All Statuses</Select.Option>
                {ORDER_STATUSES.map(status => (
                  <Select.Option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
        <Button onClick={clearFilters} type="dashed" className="mt-4">
          Clear All Filters
        </Button>
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="flex items-center m-0">
            <TableOutlined className="mr-2" /> Order List
          </Title>
          <Space>
            <Text strong>
              Showing {filteredOrders.length} of {orders.length} orders
            </Text>
            <Button onClick={fetchAllOrders} icon={<SyncOutlined />} loading={loading && orders.length > 0}>
              Refresh
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading && orders.length > 0} // Show table loading indicator when refreshing
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }}
          scroll={{ x: 'max-content' }}
          className="mt-4"
        />
      </Card>

      {selectedOrder && (
        <Modal
          title={<Title level={4} style={{ margin: 0 }}>Order Details: <Text code>{selectedOrder.id.substring(0,8)}...</Text></Title>}
          visible={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)} type="primary">
              Close
            </Button>,
          ]}
          width={800}
          destroyOnClose // Ensures modal content is fresh each time
        >
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }} layout="vertical" className="mb-6">
            <Descriptions.Item label="Order ID">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="User">{selectedOrder.userName} (<Text copyable>{selectedOrder.userId}</Text>)</Descriptions.Item>
            <Descriptions.Item label="Order Date">{formatDate(selectedOrder.orderDate)}</Descriptions.Item>
            <Descriptions.Item label="Total Amount">{formatCurrency(selectedOrder.totalAmount)}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusTagColor(selectedOrder.status)}>
                {selectedOrder.status.replace('_', ' ')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">{selectedOrder.paymentMethod === "COD" ? "Cash on Delivery" : "User Balance"}</Descriptions.Item>
            <Descriptions.Item label="Shipping Address" span={2}>{selectedOrder.address || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Phone Number" span={2}>{selectedOrder.phoneNumber || 'N/A'}</Descriptions.Item>
          </Descriptions>
          
          <Title level={5} className="mt-6 mb-3">Items Ordered</Title>
          <List
            itemLayout="horizontal"
            dataSource={selectedOrder.items}
            renderItem={item => (
              <List.Item className="border-b last:border-b-0 py-3 hover:bg-gray-50 transition-colors">
                <List.Item.Meta
                  avatar={item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded-md shadow-sm" /> : <ShoppingCartOutlined className="text-2xl text-gray-400"/>}
                  title={<Text strong className="text-base">{item.productName}</Text>}
                  description={
                    <>
                      Product ID: <Text copyable>{item.productId.substring(0,8)}...</Text> <br/>
                      Qty: {item.quantity} | Price: {formatCurrency(item.price)}
                    </>
                  }
                />
                <div className="font-semibold text-right text-lg">{formatCurrency(item.subtotal)}</div>
              </List.Item>
            )}
            className="bg-white rounded-lg"
          />
        </Modal>
      )}
    </motion.div>
  );
}
