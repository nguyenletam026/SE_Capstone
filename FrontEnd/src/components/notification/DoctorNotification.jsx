import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, IconButton, Menu, MenuItem, Typography, Avatar, Box, Divider } from "@mui/material";
import { Notifications, Close } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { connectWebSocket, registerNotificationHandler, disconnectWebSocket } from "../../services/websocket";
import { getConversation } from "../../lib/util/chatServices";
import PaymentNotificationPopup from "./PaymentNotificationPopup";

const DoctorNotification = () => {
  const { user } = useAuth();
  const { setSelectedUser, setMessages } = useChat();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const notificationSound = useRef(new Audio("/notification.mp3"));
  
  // State cho popup thông báo thanh toán
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [currentPaymentNotification, setCurrentPaymentNotification] = useState(null);

  // Xử lý thông báo nhận được
  const handleNotificationReceived = (msg) => {
    console.log("🔍 DoctorNotification nhận được thông báo:", msg);
    console.log("🔍 Loại dữ liệu:", typeof msg, "Có body?:", !!msg.body, "Có parsedBody?:", !!msg.parsedBody);
    
    try {
      // Sử dụng parsedBody thay vì body
      const notification = msg.parsedBody || JSON.parse(msg.body);
      console.log("📩 Đã phân tích thông báo:", notification);
      console.log("🔍 Loại thông báo:", notification.type);
      
      if (notification.type === "NEW_CHAT_REQUEST" || notification.type === "NEW_CHAT_PAYMENT") {
        console.log("✅ Xử lý thông báo loại:", notification.type);
        
        // Play notification sound
        notificationSound.current.play().catch(err => console.error("Failed to play notification sound:", err));
        
        // Add to notifications list
        setNotifications((prev) => {
          console.log("📝 Thêm vào danh sách thông báo, hiện có:", prev.length);
          return [notification, ...prev];
        });
        
        // Show browser notification if permission is granted
        if (Notification.permission === "granted") {
          const browserNotification = new Notification(
            notification.type === "NEW_CHAT_PAYMENT" ? "Thanh toán tư vấn mới" : "Yêu cầu trò chuyện mới", 
            {
              body: notification.message,
              icon: "/logo.png"
            }
          );
          
          browserNotification.onclick = () => {
            window.focus();
            handleChatWithPatient(notification);
          };
        }
        
        // Nếu là thông báo thanh toán, hiển thị popup
        if (notification.type === "NEW_CHAT_PAYMENT") {
          setCurrentPaymentNotification(notification);
          setPaymentPopupOpen(true);
          
          // Dispatch event để cập nhật danh sách bệnh nhân trong trang chat
          const refreshEvent = new CustomEvent('refreshPaidPatients');
          window.dispatchEvent(refreshEvent);
        }
      }
    } catch (error) {
      console.error("Failed to parse notification:", error);
    }
  };

  useEffect(() => {
    if (user?.username) {
      // Kết nối WebSocket và không sử dụng callback trực tiếp cho thông báo
      connectWebSocket(
        user.username,
        () => console.log("✅ [Doctor] Notification WebSocket connected"),
        null, // Không đăng ký messageHandler tại đây
        (err) => console.error("❌ WebSocket notification error:", err)
      );

      // Đăng ký handler riêng cho thông báo
      registerNotificationHandler(handleNotificationReceived);

      // Hiển thị thông báo test
      if (Notification.permission === "granted") {
        setTimeout(() => {
          const testNotification = new Notification("Hệ thống thông báo đã sẵn sàng", {
            body: "Bạn sẽ nhận được thông báo khi có bệnh nhân mới",
            icon: "/logo.png"
          });
          
          // Tự động đóng sau 3 giây
          setTimeout(() => testNotification.close(), 3000);
        }, 1000);
      }
    }

    // Dọn dẹp khi component unmount
    return () => {
      disconnectWebSocket();
    };
  }, [user?.username]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChatWithPatient = async (notification) => {
    // Close the menu
    handleMenuClose();
    
    // Mark notification as read
    setNotifications(notifications.filter(n => n.requestId !== notification.requestId));
    
    // Set selected user for chat
    const patientInfo = {
      patientId: notification.patientId,
      patientName: notification.patientName,
      patientAvatar: notification.patientAvatar,
      uniqueId: `patient-${notification.patientId}-${Date.now()}`
    };
    
    setSelectedUser(patientInfo);
    
    // Load conversation
    try {
      if (user?.id) {
        const conversation = await getConversation(user.id, notification.patientId);
        
        // Ensure each message has a unique ID
        const messagesWithIds = Array.isArray(conversation) ? conversation.map((msg, index) => {
          if (!msg.id) {
            return {
              ...msg,
              id: `msg-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
            };
          }
          return msg;
        }) : [];
        
        setMessages(messagesWithIds);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
    
    // Navigate to chat page
    navigate("/doctor-chat");
  };

  const handleClearNotification = (e, notificationId) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.requestId !== notificationId));
  };

  // Request notification permission when component mounts
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Đóng popup thông báo thanh toán
  const handleClosePaymentPopup = () => {
    setPaymentPopupOpen(false);
  };

  return (
    <>
      {/* Popup thông báo thanh toán mới */}
      <PaymentNotificationPopup
        open={paymentPopupOpen}
        onClose={handleClosePaymentPopup}
        notification={currentPaymentNotification}
        userId={user?.id}
        setMessages={setMessages}
      />
      
      <IconButton 
        color="inherit" 
        onClick={handleMenuOpen}
        className={notifications.length > 0 ? "new-notification-pulse" : ""}
      >
        <Badge 
          badgeContent={notifications.length} 
          color="error"
          classes={{ badge: 'notification-badge' }}
        >
          <Notifications />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 320,
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Thông báo</Typography>
          {notifications.length > 0 && (
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: "pointer" }}
              onClick={() => setNotifications([])}
            >
              Xóa tất cả
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">Không có thông báo mới</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.requestId} 
              onClick={() => handleChatWithPatient(notification)}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Avatar 
                  src={notification.patientAvatar || "/default-avatar.png"} 
                  alt={notification.patientName}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1">{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={(e) => handleClearNotification(e, notification.requestId)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default DoctorNotification; 