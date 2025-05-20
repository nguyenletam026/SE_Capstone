import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar, Typography, Box, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { getConversation } from '../../lib/util/chatServices';

const PaymentNotificationPopup = ({ 
  open, 
  onClose, 
  notification, 
  userId,
  setMessages 
}) => {
  const navigate = useNavigate();
  const { setSelectedUser } = useChat();
  
  // Thêm hiệu ứng rung để thu hút sự chú ý khi popup mở
  useEffect(() => {
    let shakingTimeout;
    if (open) {
      const dialogElement = document.querySelector('.payment-notification-dialog');
      if (dialogElement) {
        dialogElement.classList.add('shaking-animation');
        shakingTimeout = setTimeout(() => {
          dialogElement.classList.remove('shaking-animation');
        }, 1000);
      }
    }
    
    return () => {
      if (shakingTimeout) clearTimeout(shakingTimeout);
    };
  }, [open]);

  const handleViewChat = async () => {
    // Tạo đối tượng thông tin bệnh nhân để hiển thị trong chat
    const patientInfo = {
      patientId: notification?.patientId,
      patientName: notification?.patientName,
      patientAvatar: notification?.patientAvatar,
      requestId: notification?.requestId,
      uniqueId: `patient-${notification?.patientId}-${Date.now()}`
    };
    
    setSelectedUser(patientInfo);
    
    // Tải hội thoại nếu có
    try {
      if (userId && notification?.patientId) {
        const conversation = await getConversation(userId, notification.patientId);
        
        // Đảm bảo mỗi tin nhắn có ID duy nhất
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
      console.error("Lỗi khi tải hội thoại:", error);
    }
    
    // Đóng popup và chuyển đến trang chat
    onClose();
    navigate("/doctor-chat");
  };

  // Không hiển thị nếu không có thông báo
  if (!notification) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      className="payment-notification-dialog"
      TransitionComponent={Grow}
      PaperProps={{
        sx: {
          borderTop: '4px solid #1976d2',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#f0f7ff', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        py: 2.5
      }}>
        <Avatar 
          src={notification?.patientAvatar || "/default-avatar.png"}
          sx={{ 
            width: 48, 
            height: 48,
            border: '2px solid #1976d2'
          }}
        />
        <Box>
          <Typography variant="h6" color="primary">Thông báo tư vấn mới</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(notification?.timestamp).toLocaleString()}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ 
          mb: 2,
          p: 2,
          borderRadius: 1,
          bgcolor: 'rgba(25, 118, 210, 0.04)'
        }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>{notification?.patientName}</strong> đã thanh toán phí tư vấn và sẵn sàng trò chuyện với bạn!
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Người đã thanh toán sẽ được ưu tiên trò chuyện. Hãy phản hồi càng sớm càng tốt để tạo ấn tượng tốt.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Để sau
        </Button>
        <Button 
          onClick={handleViewChat} 
          variant="contained" 
          color="primary"
          sx={{
            px: 3,
            py: 1,
            boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
            }
          }}
        >
          Xem ngay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentNotificationPopup; 