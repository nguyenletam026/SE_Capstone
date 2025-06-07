import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, message, Descriptions, Space } from 'antd';
import { ExclamationCircleOutlined, HistoryOutlined, DollarOutlined } from '@ant-design/icons';
import { 
  getRefundHistory, 
  getEligibleRefunds, 
  getRefundStatistics, 
  processRefund 
} from '../../lib/refund/refundServices';

const RefundManagement = () => {
  const [refundHistory, setRefundHistory] = useState([]);
  const [eligiblePayments, setEligiblePayments] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadRefundData();
  }, []);
  const loadRefundData = async () => {
    setLoading(true);
    try {
      const [historyRes, eligibleRes, statsRes] = await Promise.all([
        getRefundHistory(),
        getEligibleRefunds(),
        getRefundStatistics()
      ]);

      setRefundHistory(historyRes.result || []);
      setEligiblePayments(eligibleRes.result || []);
      setStatistics(statsRes.result || {});
    } catch (error) {
      console.error('Error loading refund data:', error);
      message.error('Failed to load refund data');
    } finally {
      setLoading(false);
    }  };

  const processRefundHandler = async (paymentId, reason = 'Manual processing by admin') => {
    Modal.confirm({
      title: 'Confirm Refund',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to process refund for payment ${paymentId}?`,
      onOk: async () => {
        try {
          await processRefund(paymentId, reason);
          message.success('Refund processed successfully');
          loadRefundData();
        } catch (error) {
          console.error('Error processing refund:', error);
          message.error('Failed to process refund');
        }
      },
    });
  };

  const refundHistoryColumns = [
    {
      title: 'Payment ID',
      dataIndex: 'paymentId',
      key: 'paymentId',
      render: (text) => <code>{text.substring(0, 8)}...</code>
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
    },
    {
      title: 'Original Amount',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      render: (amount) => `${amount.toLocaleString()} VND`
    },
    {
      title: 'Refund Amount',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      render: (amount) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {amount.toLocaleString()} VND
        </span>
      )
    },
    {
      title: 'Refund %',
      dataIndex: 'refundPercentage',
      key: 'refundPercentage',
      render: (percentage) => <Tag color="green">{percentage}</Tag>
    },
    {
      title: 'Reason',
      dataIndex: 'refundReason',
      key: 'refundReason',
      render: (reason) => {
        const color = reason.includes('DOCTOR_NO_RESPONSE') ? 'red' : 'blue';
        return <Tag color={color}>{reason}</Tag>;
      }
    },
    {
      title: 'Refund Date',
      dataIndex: 'refundDate',
      key: 'refundDate',
      render: (date) => new Date(date).toLocaleString()
    }
  ];

  const eligiblePaymentsColumns = [
    {
      title: 'Payment ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <code>{text.substring(0, 8)}...</code>
    },
    {
      title: 'Patient',
      dataIndex: ['chatRequest', 'patient', 'firstName'],
      key: 'patient',
      render: (firstName, record) => 
        `${firstName || ''} ${record.chatRequest?.patient?.lastName || ''}`
    },
    {
      title: 'Doctor',
      dataIndex: ['chatRequest', 'doctor', 'firstName'],
      key: 'doctor',
      render: (firstName, record) => 
        `${firstName || ''} ${record.chatRequest?.doctor?.lastName || ''}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString()} VND`
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours) => `${hours}h`
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (        <Button
          type="primary"
          danger
          size="small"
          onClick={() => processRefundHandler(record.id)}
          icon={<DollarOutlined />}
        >
          Process Refund
        </Button>
      )
    }
  ];

  return (
    <div className="refund-management">
      <Card title="Refund Management" extra={
        <Space>
          <Button 
            type={activeTab === 'history' ? 'primary' : 'default'}
            icon={<HistoryOutlined />}
            onClick={() => setActiveTab('history')}
          >
            Refund History
          </Button>
          <Button 
            type={activeTab === 'eligible' ? 'primary' : 'default'}
            icon={<ExclamationCircleOutlined />}
            onClick={() => setActiveTab('eligible')}
          >
            Eligible for Refund
          </Button>
        </Space>
      }>
        
        {/* Statistics Panel */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Descriptions title="Refund Statistics" column={4}>
            <Descriptions.Item label="Total Refunds This Month">
              {statistics.totalRefundsThisMonth || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount Refunded">
              {(statistics.totalRefundAmountThisMonth || 0).toLocaleString()} VND
            </Descriptions.Item>
            <Descriptions.Item label="Payments Eligible for Refund">
              {statistics.paymentsEligibleForRefund || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Auto Refund Rate">
              {statistics.refundReasons?.DOCTOR_NO_RESPONSE || 0} / {statistics.totalRefundsThisMonth || 0}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Content based on active tab */}
        {activeTab === 'history' && (
          <Table
            columns={refundHistoryColumns}
            dataSource={refundHistory}
            rowKey="paymentId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 1200 }}
          />
        )}

        {activeTab === 'eligible' && (
          <Table
            columns={eligiblePaymentsColumns}
            dataSource={eligiblePayments}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>
    </div>
  );
};

export default RefundManagement;
