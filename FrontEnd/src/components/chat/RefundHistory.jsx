import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Input, message, Empty, Statistic, Row, Col, Typography, Divider, Space, Tooltip, Skeleton } from 'antd';
import { 
  HistoryOutlined, 
  ExclamationCircleOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MoneyCollectOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { getUserRefundHistory, requestRefund } from '../../lib/refund/refundServices';
import './RefundHistory.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const RefundHistory = () => {
  const [refundHistory, setRefundHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestRefundModal, setRequestRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    loadRefundHistory();
  }, []);
  const loadRefundHistory = async () => {
    setLoading(true);
    try {
      const response = await getUserRefundHistory();
      setRefundHistory(response.result || []);
    } catch (error) {
      console.error('Error loading refund history:', error);
      message.error('Failed to load refund history');
    } finally {
      setLoading(false);
    }
  };
  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      message.error('Please provide a reason for the refund request');
      return;
    }

    try {
      await requestRefund(selectedPayment.paymentId, refundReason);
      message.success('Refund request submitted successfully');
      setRequestRefundModal(false);
      setRefundReason('');
      setSelectedPayment(null);
      loadRefundHistory();
    } catch (error) {
      console.error('Error requesting refund:', error);
      message.error('Failed to submit refund request');
    }
  };  const columns = [
    {
      title: (
        <Space>
          <InfoCircleOutlined className="text-blue-500" />
          <span className="font-semibold text-gray-700">Chat Session</span>
        </Space>
      ),
      dataIndex: 'chatRequestId',
      key: 'chatRequestId',
      width: 120,
      responsive: ['lg'],
      render: (text) => (
        <div className="flex items-center space-x-2">
          <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            <code className="text-blue-600 font-mono text-sm">{text.substring(0, 8)}...</code>
          </div>
        </div>
      )
    },
    {
      title: (
        <Space>
          <UserOutlined className="text-green-500" />
          <span className="font-semibold text-gray-700">Doctor</span>
        </Space>
      ),
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 180,
      render: (name) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <UserOutlined className="text-white text-sm" />
          </div>
          <span className="font-medium text-gray-800 truncate">{name}</span>
        </div>
      )
    },
    {
      title: (
        <Space>
          <ClockCircleOutlined className="text-purple-500" />
          <span className="font-semibold text-gray-700">Hours</span>
        </Space>
      ),
      dataIndex: 'hoursPurchased',
      key: 'hoursPurchased',
      width: 100,
      responsive: ['md'],
      render: (hours) => (
        <div className="bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 text-center">
          <span className="text-purple-700 font-bold">{hours}h</span>
        </div>
      )
    },
    {
      title: (
        <Space>
          <MoneyCollectOutlined className="text-orange-500" />
          <span className="font-semibold text-gray-700">Original</span>
        </Space>
      ),
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      width: 140,
      render: (amount) => (
        <div className="bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
          <span className="text-orange-700 font-bold text-sm">{amount.toLocaleString()}</span>
          <div className="text-xs text-orange-600">VND</div>
        </div>
      )
    },
    {
      title: (
        <Space>
          <DollarOutlined className="text-green-500" />
          <span className="font-semibold text-gray-700">Refund</span>
        </Space>
      ),
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 140,
      render: (amount) => (
        <div className="bg-green-50 px-2 py-1 rounded-lg border border-green-200">
          <span className="text-green-700 font-bold text-sm">
            +{amount.toLocaleString()}
          </span>
          <div className="text-xs text-green-600">VND</div>
        </div>
      )
    },
    {
      title: (
        <Space>
          <PercentageOutlined className="text-cyan-500" />
          <span className="font-semibold text-gray-700">%</span>
        </Space>
      ),
      dataIndex: 'refundPercentage',
      key: 'refundPercentage',
      width: 80,
      responsive: ['sm'],
      render: (percentage) => (
        <Tag 
          color="cyan" 
          className="px-2 py-1 rounded-full font-bold text-cyan-700 border-cyan-300 text-center"
        >
          {percentage}
        </Tag>
      )
    },
    {
      title: (
        <Space>
          <ExclamationCircleOutlined className="text-yellow-500" />
          <span className="font-semibold text-gray-700">Reason</span>
        </Space>
      ),
      dataIndex: 'refundReason',
      key: 'refundReason',
      width: 200,
      render: (reason) => {
        let color = 'blue';
        let displayText = reason;
        let bgClass = 'bg-blue-50 border-blue-200 text-blue-700';
        
        if (reason === 'DOCTOR_NO_RESPONSE') {
          color = 'red';
          displayText = 'Doctor did not respond';
          bgClass = 'bg-red-50 border-red-200 text-red-700';
        } else if (reason.includes('Patient request')) {
          color = 'orange';
          displayText = 'Patient request';
          bgClass = 'bg-orange-50 border-orange-200 text-orange-700';
        } else if (reason.includes('Manual processing')) {
          color = 'purple';
          displayText = 'Manual processing';
          bgClass = 'bg-purple-50 border-purple-200 text-purple-700';
        }
        
        return (
          <Tooltip title={reason}>
            <div className={`px-2 py-1 rounded-lg border ${bgClass} font-medium text-sm truncate`}>
              {displayText}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: (
        <Space>
          <CalendarOutlined className="text-indigo-500" />
          <span className="font-semibold text-gray-700">Payment</span>
        </Space>
      ),
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      responsive: ['lg'],
      render: (date) => (
        <div className="text-gray-600 text-sm">
          <CalendarOutlined className="mr-1 text-indigo-500" />
          {new Date(date).toLocaleDateString('en-GB')}
        </div>
      )
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined className="text-emerald-500" />
          <span className="font-semibold text-gray-700">Refunded</span>
        </Space>
      ),
      dataIndex: 'refundDate',
      key: 'refundDate',
      width: 120,
      responsive: ['lg'],
      render: (date) => (
        <div className="text-gray-600 text-sm">
          <CheckCircleOutlined className="mr-1 text-emerald-500" />
          {new Date(date).toLocaleDateString('en-GB')}
        </div>
      )
    }
  ];
  // Calculate statistics
  const totalRefunded = refundHistory.reduce((sum, refund) => sum + refund.refundAmount, 0);
  const totalOriginal = refundHistory.reduce((sum, refund) => sum + refund.originalAmount, 0);
  const averageRefundPercentage = refundHistory.length > 0 
    ? Math.round(refundHistory.reduce((sum, refund) => 
        sum + parseFloat(refund.refundPercentage.replace('%', '')), 0) / refundHistory.length)
    : 0;
  return (
    <div className="refund-history bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <Title level={2} className="text-white mb-2 flex items-center text-xl md:text-2xl">
                <HistoryOutlined className="mr-3 text-2xl md:text-3xl" />
                Refund History
              </Title>
              <Text className="text-blue-100 text-base md:text-lg">
                Track all your refund transactions and manage new requests
              </Text>
            </div>
            <Button 
              type="primary" 
              size="large"
              icon={<DollarOutlined />}
              onClick={() => setRequestRefundModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 border-none shadow-lg font-semibold w-full md:w-auto"
            >
              Request Refund
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <>
          <Row gutter={[24, 24]} className="mb-8">
            {[1, 2, 3, 4].map(item => (
              <Col xs={24} sm={12} lg={6} key={item}>
                <Card className="text-center shadow-lg border-0 rounded-xl">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
          <Card className="shadow-xl border-0 rounded-2xl">
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </>
      )}

      {/* Statistics Cards */}
      {!loading && refundHistory.length > 0 && (
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg border-0 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
              <Statistic
                title={<span className="text-gray-600 font-semibold text-sm md:text-base">Total Refunded</span>}
                value={totalRefunded}
                precision={0}
                valueStyle={{ color: '#059669', fontSize: '20px', fontWeight: 'bold' }}
                prefix={<MoneyCollectOutlined className="text-green-500" />}
                suffix="VND"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg border-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
              <Statistic
                title={<span className="text-gray-600 font-semibold text-sm md:text-base">Total Transactions</span>}
                value={refundHistory.length}
                valueStyle={{ color: '#3b82f6', fontSize: '20px', fontWeight: 'bold' }}
                prefix={<HistoryOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg border-0 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300">
              <Statistic
                title={<span className="text-gray-600 font-semibold text-sm md:text-base">Average Refund</span>}
                value={averageRefundPercentage}
                valueStyle={{ color: '#8b5cf6', fontSize: '20px', fontWeight: 'bold' }}
                prefix={<PercentageOutlined className="text-purple-500" />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-lg border-0 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-all duration-300">
              <Statistic
                title={<span className="text-gray-600 font-semibold text-sm md:text-base">Original Amount</span>}
                value={totalOriginal}
                precision={0}
                valueStyle={{ color: '#f59e0b', fontSize: '20px', fontWeight: 'bold' }}
                prefix={<DollarOutlined className="text-orange-500" />}
                suffix="VND"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content Card */}
      {!loading && (
        <Card 
          className="shadow-xl border-0 rounded-2xl overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          {refundHistory.length === 0 ? (
            <div className="py-16 md:py-20">
              <Empty 
                description={
                  <div className="text-center">
                    <Title level={4} className="text-gray-500 mb-2">No refund history found</Title>
                    <Text className="text-gray-400 text-center block">
                      You haven't made any refund requests yet. 
                      <br className="hidden md:block" />
                      Click the "Request Refund" button to start a new request.
                    </Text>
                  </div>
                }
                image={
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <HistoryOutlined className="text-3xl md:text-4xl text-gray-400" />
                    </div>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="p-4 md:p-6">
              <div className="mb-6">
                <Title level={4} className="text-gray-700 flex items-center mb-2 text-lg md:text-xl">
                  <InfoCircleOutlined className="mr-2 text-blue-500" />
                  Transaction Details
                </Title>
                <Text className="text-gray-500 text-sm md:text-base">
                  All your refund transactions are listed below with complete details
                </Text>
              </div>
              
              <Table
                columns={columns}
                dataSource={refundHistory}
                rowKey="paymentId"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} transactions`,
                  responsive: true,
                }}
                scroll={{ x: 1200 }}
                className="custom-table"
                rowClassName={(record, index) => 
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }
                size="middle"
              />
            </div>
          )}
        </Card>
      )}{/* Enhanced Request Refund Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3 py-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <DollarOutlined className="text-white text-lg" />
            </div>
            <div>
              <Title level={4} className="mb-0 text-gray-800">Request Refund</Title>
              <Text className="text-gray-500 text-sm">Submit your refund request with details</Text>
            </div>
          </div>
        }
        open={requestRefundModal}
        onOk={handleRequestRefund}
        onCancel={() => {
          setRequestRefundModal(false);
          setRefundReason('');
          setSelectedPayment(null);
        }}
        width={700}
        centered
        okText="Submit Request"
        cancelText="Cancel"
        okButtonProps={{
          size: 'large',
          className: 'bg-gradient-to-r from-blue-500 to-purple-500 border-none shadow-lg'
        }}
        cancelButtonProps={{
          size: 'large'
        }}
        className="custom-modal"
      >
        <div className="py-4">
          <div className="mb-6">
            <Title level={5} className="text-gray-700 flex items-center mb-3">
              <ExclamationCircleOutlined className="mr-2 text-yellow-500" />
              Reason for Refund Request
            </Title>
            <TextArea
              rows={5}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Please provide a detailed reason for your refund request. For example:
• Doctor never responded to my messages
• Technical issues prevented proper consultation  
• Service quality was unsatisfactory
• Billing error occurred"
              maxLength={500}
              showCount
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <Divider />
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <Title level={5} className="text-blue-700 flex items-center mb-3">
              <InfoCircleOutlined className="mr-2" />
              Refund Policy & Information
            </Title>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Automatic refunds:</strong> Processed if doctor doesn't respond within 30 minutes
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <ClockCircleOutlined className="text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Processing time:</strong> Manual requests reviewed within 24-48 hours
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <PercentageOutlined className="text-purple-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Refund amount:</strong> Depends on reason and timing of request
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <UserOutlined className="text-orange-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Support:</strong> Our team reviews all manual refund requests
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RefundHistory;
