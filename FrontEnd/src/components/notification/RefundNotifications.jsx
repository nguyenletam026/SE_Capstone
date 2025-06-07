import React, { useState, useEffect } from 'react';
import { notification, Badge, Drawer, List, Tag, Button, Empty } from 'antd';
import { BellOutlined, DollarOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import apiService from '../../lib/apiService';

const RefundNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Set up WebSocket or polling for real-time notifications
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // This would be a real API call to get notifications
      // For now, we'll simulate with localStorage
      const stored = localStorage.getItem('refundNotifications');
      const notifs = stored ? JSON.parse(stored) : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('refundNotifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('refundNotifications', JSON.stringify(updated));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REFUND_PROCESSED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'DOCTOR_WARNING':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'REFUND_REQUESTED':
        return <DollarOutlined style={{ color: '#1890ff' }} />;
      default:
        return <BellOutlined />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'REFUND_PROCESSED':
        return 'success';
      case 'DOCTOR_WARNING':
        return 'warning';
      case 'REFUND_REQUESTED':
        return 'processing';
      default:
        return 'default';
    }
  };

  // Example function to add a notification (would be called from WebSocket or other events)
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    localStorage.setItem('refundNotifications', JSON.stringify(updated));
    setUnreadCount(updated.filter(n => !n.read).length);
    
    // Show system notification
    notification.open({
      message: notification.title,
      description: notification.message,
      icon: getNotificationIcon(notification.type),
      placement: 'topRight',
    });
  };

  // Expose addNotification globally for use by other components
  window.addRefundNotification = addNotification;

  return (
    <>
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{ fontSize: '16px' }}
        />
      </Badge>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Refund Notifications</span>
            {unreadCount > 0 && (
              <Button size="small" type="link" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {notifications.length === 0 ? (
          <Empty description="No notifications" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  backgroundColor: item.read ? 'transparent' : '#f6ffed',
                  marginBottom: 8,
                  padding: 12,
                  borderRadius: 6,
                  border: item.read ? '1px solid #f0f0f0' : '1px solid #b7eb8f'
                }}
                onClick={() => !item.read && markAsRead(item.id)}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(item.type)}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                        {item.title}
                      </span>
                      <Tag color={getNotificationColor(item.type)} size="small">
                        {item.type.replace('_', ' ')}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 4 }}>{item.message}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
};

export default RefundNotifications;
