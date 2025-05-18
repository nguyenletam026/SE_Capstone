import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, IconButton, Menu, MenuItem, Typography, Avatar, Box, Divider } from "@mui/material";
import { Notifications, Close } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { connectWebSocket } from "../../services/websocket";
import { getConversation } from "../../lib/util/chatServices";

const DoctorNotification = () => {
  const { user } = useAuth();
  const { setSelectedUser, setMessages } = useChat();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const notificationSound = useRef(new Audio("/notification.mp3"));

  useEffect(() => {
    if (user?.username) {
      // Connect to WebSocket for notifications
      connectWebSocket(
        user.username,
        () => console.log("✅ [Doctor] Notification WebSocket connected"),
        handleNotificationReceived,
        (err) => console.error("❌ WebSocket notification error:", err)
      );
    }
  }, [user?.username]);

  const handleNotificationReceived = (msg) => {
    try {
      const notification = JSON.parse(msg.body);
      console.log("📩 Received notification:", notification);
      
      if (notification.type === "NEW_CHAT_REQUEST") {
        // Play notification sound
        notificationSound.current.play().catch(err => console.error("Failed to play notification sound:", err));
        
        // Add to notifications list
        setNotifications((prev) => [notification, ...prev]);
        
        // Show browser notification if permission is granted
        if (Notification.permission === "granted") {
          const browserNotification = new Notification("Yêu cầu trò chuyện mới", {
            body: notification.message,
            icon: "/logo.png"
          });
          
          browserNotification.onclick = () => {
            window.focus();
            handleChatWithPatient(notification);
          };
        }
      }
    } catch (error) {
      console.error("Failed to parse notification:", error);
    }
  };

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

  return (
    <>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <Badge badgeContent={notifications.length} color="error">
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