import React, { useState, useEffect, useCallback } from "react";
import { createDeposit, checkDepositStatus, getCurrentBalance } from "../../lib/user/depositServices";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Fade,
  Chip,
  Stack,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import { 
  AccountBalance, 
  Payment, 
  QrCode2, 
  Refresh, 
  CurrencyExchange,
  CheckCircle,
  ErrorOutline,
  TimerOutlined,
  LocalAtm,
  Article,
  ContentCopy,
  Info,
  History,
  Bolt,
  AttachMoney,
  Close,
  AccessTime
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: 16,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 40%)',
  }
}));

const AmountButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.5),
  minWidth: 100,
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },
}));

const QRContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
  textAlign: 'center',
}));

const CountdownProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

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
  
  // Format time as mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Calculate progress percentage (reverse progress - starts at 100%, ends at 0%)
  const progressPercentage = (timeLeft / initialTime) * 100;
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <AccessTime color="error" sx={{ mr: 1 }} />
        <Typography variant="h5" color="error.main" fontWeight={500}>
          {formattedTime}
        </Typography>
      </Box>
      <CountdownProgress 
        variant="determinate" 
        value={progressPercentage} 
        color={progressPercentage > 50 ? "primary" : progressPercentage > 20 ? "warning" : "error"} 
      />
      <Typography variant="body2" color="text.secondary" align="center">
        Thời gian còn lại để hoàn tất thanh toán
      </Typography>
    </Box>
  );
};

const DepositForm = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [depositData, setDepositData] = useState(null);
  const [depositStatus, setDepositStatus] = useState("pending");
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 5 minutes in seconds
  const TIMEOUT_DURATION = 5 * 60;

  // Lấy số dư hiện tại
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getCurrentBalance();
        setBalance(data.balance);
        setUsername(data.username);
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };
    fetchBalance();
  }, []);

  // Kiểm tra trạng thái giao dịch mỗi 5 giây khi dialog hiển thị
  useEffect(() => {
    let intervalId;

    if (qrDialogOpen && depositData?.transactionContent) {
      intervalId = setInterval(async () => {
        try {
          const status = await checkDepositStatus(depositData.transactionContent);
          if (status.completed) {
            setDepositStatus("success");
            // Cập nhật số dư sau khi nạp tiền thành công
            const newBalance = await getCurrentBalance();
            setBalance(newBalance.balance);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Error checking deposit status:", err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [qrDialogOpen, depositData]);

  const handleTimeout = useCallback(() => {
    if (depositStatus === "pending") {
      setDepositStatus("failed");
    }
  }, [depositStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await createDeposit(parseFloat(amount));
      setDepositData(data);
      setDepositStatus("pending");
      setQrDialogOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    setDepositData(null);
    setDepositStatus("pending");
    setAmount("");
    setQrDialogOpen(false);
  };

  const handleCloseDialog = () => {
    if (depositStatus === "success") {
      handleNewTransaction();
    } else {
      setQrDialogOpen(false);
    }
  };

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    try {
      const data = await getCurrentBalance();
      setBalance(data.balance);
    } catch (err) {
      console.error("Error refreshing balance:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  const handleCopyTransaction = () => {
    if (depositData?.transactionContent) {
      navigator.clipboard.writeText(depositData.transactionContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleAmountClick = (amt) => {
    setAmount(amt.toString());
  };

  // Các mệnh giá nạp tiền phổ biến
  const commonAmounts = [50000, 100000, 200000, 500000, 1000000];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        {/* Phần bên trái: Số dư và thông tin tài khoản */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <GradientCard>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "500", color: "#fff" }}>
                    Số dư tài khoản
                  </Typography>
                  <Tooltip title="Làm mới số dư">
                    <IconButton 
                      onClick={handleRefreshBalance} 
                      sx={{ color: "#fff", opacity: 0.9 }}
                      size="small"
                    >
                      <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
                  <Typography variant="h3" sx={{ mr: 1, fontWeight: "700", letterSpacing: "-0.5px" }}>
                    {balance.toLocaleString()}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 0.5, opacity: 0.9 }}>VND</Typography>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Chip 
                    icon={<AccountBalance sx={{ fontSize: 16, color: "#fff" }} />}
                    label={username}
                    variant="outlined"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: '#fff',
                      border: 'none',
                      '& .MuiChip-label': { fontWeight: 500 }
                    }}
                  />
                </Box>
              </CardContent>
            </GradientCard>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Info sx={{ mr: 1, color: "info.main", fontSize: 20 }} />
                  <Typography variant="h6">Hướng dẫn nạp tiền</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "flex-start" }}>
                    <CheckCircle sx={{ mr: 1, fontSize: 18, color: "success.main", mt: 0.3 }} />
                    Nhập số tiền cần nạp và nhấn "Tạo yêu cầu"
                  </Typography>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "flex-start" }}>
                    <CheckCircle sx={{ mr: 1, fontSize: 18, color: "success.main", mt: 0.3 }} />
                    Quét mã QR hoặc chuyển khoản theo thông tin
                  </Typography>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "flex-start" }}>
                    <CheckCircle sx={{ mr: 1, fontSize: 18, color: "success.main", mt: 0.3 }} />
                    Sử dụng đúng mã giao dịch khi thanh toán
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Button 
              variant="text" 
              color="primary"
              startIcon={<History />}
              onClick={() => setShowHistory(!showHistory)}
              sx={{ justifyContent: "flex-start" }}
            >
              Xem lịch sử giao dịch
            </Button>
          </Stack>
        </Grid>

        {/* Phần bên phải: Form nạp tiền */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              bgcolor: "white", 
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Tiêu đề chính */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }}>
              <CurrencyExchange 
                sx={{ 
                  mr: 1.5, 
                  color: "primary.main", 
                  fontSize: 28,
                  p: 0.8,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                }} 
              />
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Nạp tiền vào tài khoản
              </Typography>
            </Box>

            {error && (
              <Fade in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }} 
                  onClose={() => setError("")}
                  variant="filled"
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Vui lòng nhập số tiền bạn muốn nạp vào tài khoản
              </Typography>
              
              {/* Các mệnh giá phổ biến */}
              <Box sx={{ display: "flex", flexWrap: "wrap", mb: 3, mt: 2 }}>
                {commonAmounts.map((amt) => (
                  <AmountButton
                    key={amt}
                    onClick={() => handleAmountClick(amt)}
                    variant={amount === amt.toString() ? "contained" : "outlined"}
                    color={amount === amt.toString() ? "primary" : "inherit"}
                  >
                    {amt.toLocaleString()} ₫
                  </AmountButton>
                ))}
              </Box>
              
              <TextField
                fullWidth
                label="Số tiền (VND)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                sx={{ mb: 3 }}
                inputProps={{ min: 10000 }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <LocalAtm color="primary" sx={{ mr: 0.5 }} />
                      <Typography>₫</Typography>
                    </Box>
                  ),
                }}
                helperText="Số tiền tối thiểu: 10,000 VND"
              />
              
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading || !amount}
                size="large"
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Bolt />}
              >
                {loading ? "Đang xử lý..." : "Tạo yêu cầu nạp tiền"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Collapse component để hiển thị lịch sử giao dịch */}
      <Collapse in={showHistory}>
        <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <History sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Lịch sử giao dịch</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Chức năng đang được phát triển...
          </Typography>
        </Paper>
      </Collapse>

      {/* QR Code Dialog with Countdown Timer */}
      <Dialog 
        open={qrDialogOpen} 
        onClose={() => {
          // Prevent accidentally closing if transaction is pending
          if (depositStatus !== "pending") {
            handleCloseDialog();
          }
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <QrCode2 sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h6">Thanh toán</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} disabled={depositStatus === "pending"}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {depositStatus === "pending" && (
            <CountdownTimer 
              initialTime={TIMEOUT_DURATION} 
              onTimeout={handleTimeout} 
            />
          )}

          {/* Thông tin số tiền và mã giao dịch */}
          <Grid container spacing={3} sx={{ mb: 3, mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                bgcolor: 'success.light', 
                borderRadius: 2,
                height: '100%',
              }}>
                <CardContent>
                  <Typography variant="subtitle2" color="success.dark" gutterBottom>
                    Số tiền
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, color: 'success.dark' }} />
                    <Typography variant="h5" color="success.dark" fontWeight={600}>
                      {depositData?.amount.toLocaleString()} VND
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ 
                bgcolor: 'grey.100', 
                borderRadius: 2,
                height: '100%',
              }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Mã giao dịch
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Article sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="h6" fontWeight={500}>
                        {depositData?.transactionContent}
                      </Typography>
                    </Box>
                    <Tooltip title={copied ? "Đã sao chép!" : "Sao chép mã"}>
                      <IconButton size="small" onClick={handleCopyTransaction}>
                        <ContentCopy fontSize="small" color={copied ? "primary" : "action"} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Hiển thị mã QR */}
          <QRContainer>
            <img
              src={depositData?.qrImageUrl}
              alt="QR Code"
              style={{ 
                maxWidth: "100%", 
                height: "auto", 
                borderRadius: "8px",
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            />
            <Typography 
              variant="subtitle1" 
              color="primary.dark" 
              sx={{ mt: 2, fontWeight: 500 }}
            >
              Quét mã QR để hoàn tất thanh toán
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Lưu ý sử dụng đúng nội dung chuyển khoản
            </Typography>
          </QRContainer>

          {/* Hiển thị trạng thái giao dịch */}
          {depositStatus === "success" && (
            <Alert 
              icon={<CheckCircle />} 
              severity="success" 
              sx={{ mt: 3 }}
              variant="filled"
            >
              <Typography fontWeight={500}>
                Nạp tiền thành công! Số dư của bạn đã được cập nhật.
              </Typography>
            </Alert>
          )}
          {depositStatus === "failed" && (
            <Alert 
              icon={<ErrorOutline />} 
              severity="warning" 
              sx={{ mt: 3 }}
              variant="filled"
            >
              <Typography fontWeight={500}>
                Hết thời gian thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: depositStatus === "pending" ? "center" : "flex-end" }}>
          {depositStatus === "pending" ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Vui lòng không đóng cửa sổ này cho đến khi thanh toán hoàn tất
            </Typography>
          ) : (
            <Button 
              onClick={handleNewTransaction}
              variant="contained" 
              startIcon={depositStatus === "success" ? <CheckCircle /> : <Refresh />}
            >
              {depositStatus === "success" ? "Hoàn thành" : "Tạo giao dịch mới"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepositForm;