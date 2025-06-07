import React, { useState, useEffect, useCallback } from "react";
import { createDeposit, checkDepositStatus } from "../../lib/user/depositServices";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Fade,
} from "@mui/material";
import { 
  Close,
  Payment,
  QrCode2,
  Refresh,
  CheckCircle,
  ErrorOutline,
  AccessTime,
  AttachMoney
} from "@mui/icons-material";

// Quick amount options
const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

// Countdown timer component
const CountdownTimer = ({ initialTime, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((initialTime - timeLeft) / initialTime) * 100;

  return (
    <Box sx={{ mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" color="text.secondary">
          <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
          Thời gian còn lại: {minutes}:{seconds.toString().padStart(2, '0')}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 6, 
          borderRadius: 3,
          backgroundColor: 'rgba(255, 152, 0, 0.2)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: progress > 80 ? '#f44336' : '#ff9800'
          }
        }} 
      />
    </Box>
  );
};

const InlineDepositModal = ({ 
  open, 
  onClose, 
  onDepositSuccess, 
  requiredAmount = 0,
  currentBalance = 0 
}) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [depositStatus, setDepositStatus] = useState("pending");
  const [error, setError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setAmount("");
      setQrData(null);
      setDepositStatus("pending");
      setError("");
      setCheckingStatus(false);
      
      // Suggest minimum required amount
      const suggestedAmount = Math.max(requiredAmount - currentBalance, 50000);
      setAmount(suggestedAmount.toString());
    }
  }, [open, requiredAmount, currentBalance]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
    setError("");
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    setError("");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleCreateDeposit = async () => {
    if (!amount || parseInt(amount) < 10000) {
      setError("Số tiền nạp tối thiểu là 10,000 VND");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await createDeposit(parseInt(amount));
      setQrData(response);
      setDepositStatus("waiting");
        // Start checking deposit status
      setTimeout(() => {
        checkStatus(response.transactionContent);
      }, 2000);
    } catch (err) {
      console.error("Error creating deposit:", err);
      setError(err.message || "Không thể tạo giao dịch nạp tiền");
    } finally {
      setLoading(false);
    }
  };
  const checkStatus = useCallback(async (transactionContent) => {
    setCheckingStatus(true);
    try {
      const response = await checkDepositStatus(transactionContent);
      
      if (response.completed) {
        setDepositStatus("completed");
        setCheckingStatus(false);
        
        // Call success callback after a short delay to show success state
        setTimeout(() => {
          onDepositSuccess && onDepositSuccess(parseInt(amount));
        }, 1500);
      } else {
        // Continue checking if still pending
        setTimeout(() => {
          checkStatus(transactionContent);
        }, 3000);
      }
    } catch (err) {
      console.error("Error checking deposit status:", err);
      setDepositStatus("failed");
      setError("Không thể kiểm tra trạng thái giao dịch. Vui lòng thử lại.");
      setCheckingStatus(false);
    }
  }, [amount, onDepositSuccess]);

  const handleTimeout = () => {
    setDepositStatus("expired");
    setError("Giao dịch đã hết hạn. Vui lòng tạo giao dịch mới.");
  };

  const handleClose = () => {
    if (depositStatus === "waiting" || checkingStatus) {
      // Don't close while transaction is in progress
      return;
    }
    onClose();
  };

  const shortfall = Math.max(requiredAmount - currentBalance, 0);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={depositStatus === "waiting" || checkingStatus}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box display="flex" alignItems="center">
          <Payment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Nạp tiền nhanh</Typography>
        </Box>
        {depositStatus !== "waiting" && !checkingStatus && (
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {/* Balance info */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Số dư hiện tại:</strong> {formatCurrency(currentBalance)}
            <br />
            <strong>Số tiền cần:</strong> {formatCurrency(requiredAmount)}
            <br />
            <strong>Thiếu:</strong> {formatCurrency(shortfall)}
          </Typography>
        </Alert>

        {!qrData ? (
          // Amount input form
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Chọn số tiền nạp:
            </Typography>
            
            {/* Quick amount buttons */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <Chip
                  key={quickAmount}
                  label={formatCurrency(quickAmount)}
                  onClick={() => handleQuickAmount(quickAmount)}
                  variant={amount === quickAmount.toString() ? "filled" : "outlined"}
                  color="primary"
                  size="small"
                  clickable
                />
              ))}
            </Stack>

            <TextField
              fullWidth
              label="Số tiền (VND)"
              value={amount ? parseInt(amount).toLocaleString('vi-VN') : ''}
              onChange={handleAmountChange}
              error={!!error}
              helperText={error || "Số tiền tối thiểu: 10,000 VND"}
              variant="outlined"
              size="medium"
              sx={{ mb: 2 }}
            />

            {amount && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Sau khi nạp: {formatCurrency(currentBalance + parseInt(amount || 0))}
                </Typography>
              </Alert>
            )}
          </Box>
        ) : (
          // QR Code display
          <Box textAlign="center">
            {depositStatus === "waiting" && (
              <Fade in={true}>
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    <QrCode2 sx={{ mr: 1 }} />
                    Quét mã QR để thanh toán
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    mb: 2
                  }}>                    <img 
                      src={qrData.qrImageUrl} 
                      alt="QR Code" 
                      style={{ 
                        width: 200, 
                        height: 200,
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Số tiền: <strong>{formatCurrency(parseInt(amount))}</strong>
                  </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nội dung: {qrData.transactionContent}
                  </Typography>

                  <CountdownTimer 
                    initialTime={300} // 5 minutes
                    onTimeout={handleTimeout}
                  />

                  {checkingStatus && (
                    <Box sx={{ mt: 2 }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Đang kiểm tra thanh toán...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Fade>
            )}

            {depositStatus === "completed" && (
              <Fade in={true}>
                <Box>
                  <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Nạp tiền thành công!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Số dư mới: {formatCurrency(currentBalance + parseInt(amount))}
                  </Typography>
                </Box>
              </Fade>
            )}

            {depositStatus === "failed" && (
              <Box>
                <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" color="error.main" gutterBottom>
                  Giao dịch thất bại
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {error}
                </Typography>
              </Box>
            )}

            {depositStatus === "expired" && (
              <Box>
                <ErrorOutline sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" color="warning.main" gutterBottom>
                  Giao dịch hết hạn
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {error}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {!qrData ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateDeposit}
              disabled={loading || !amount || parseInt(amount) < 10000}
              startIcon={loading ? <CircularProgress size={16} /> : <AttachMoney />}
            >
              {loading ? "Đang tạo..." : "Tạo QR nạp tiền"}
            </Button>
          </>
        ) : (
          <>
            {(depositStatus === "failed" || depositStatus === "expired") && (
              <Button
                variant="outlined"
                onClick={() => {
                  setQrData(null);
                  setDepositStatus("pending");
                  setError("");
                }}
                startIcon={<Refresh />}
              >
                Thử lại
              </Button>
            )}
            
            {depositStatus === "completed" && (
              <Button
                variant="contained"
                onClick={handleClose}
                startIcon={<CheckCircle />}
              >
                Hoàn thành
              </Button>
            )}            {depositStatus === "waiting" && (
              <Button
                variant="outlined"
                onClick={() => checkStatus(qrData.transactionContent)}
                disabled={checkingStatus}
                startIcon={checkingStatus ? <CircularProgress size={16} /> : <Refresh />}
              >
                {checkingStatus ? "Đang kiểm tra..." : "Kiểm tra lại"}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InlineDepositModal;
