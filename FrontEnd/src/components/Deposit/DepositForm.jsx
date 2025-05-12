import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { AccountBalance, Payment, QrCode2, Refresh } from "@mui/icons-material";

const DepositForm = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [depositData, setDepositData] = useState(null);
  const [depositStatus, setDepositStatus] = useState("pending");
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("");

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

  // Kiểm tra trạng thái giao dịch mỗi 5 giây
  useEffect(() => {
    let intervalId;

    if (depositData?.transactionContent) {
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

      // Dừng kiểm tra sau 5 phút
      setTimeout(() => {
        clearInterval(intervalId);
        if (depositStatus === "pending") {
          setDepositStatus("failed");
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [depositData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await createDeposit(parseFloat(amount));
      setDepositData(data);
      setDepositStatus("pending");
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
  };

  const handleRefreshBalance = async () => {
    try {
      const data = await getCurrentBalance();
      setBalance(data.balance);
    } catch (err) {
      console.error("Error refreshing balance:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Grid container spacing={3}>
        {/* Card hiển thị số dư */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", bgcolor: "#f5f5f5" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6" color="text.secondary">
                  Số dư hiện tại
                </Typography>
                <Tooltip title="Làm mới số dư">
                  <IconButton onClick={handleRefreshBalance} sx={{ ml: "auto" }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" color="primary" sx={{ fontWeight: "bold" }}>
                {balance.toLocaleString()} VND
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tài khoản: {username}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Form nạp tiền */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, bgcolor: "white" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Payment sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h5" component="h1">
                Nạp tiền vào tài khoản
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!depositData ? (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Số tiền (VND)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                  inputProps={{ min: 1000 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₫</Typography>,
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading || !amount}
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                >
                  {loading ? "Đang xử lý..." : "Tạo yêu cầu nạp tiền"}
                </Button>
              </form>
            ) : (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <QrCode2 sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6">Thông tin giao dịch</Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Số tiền
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {depositData.amount.toLocaleString()} VND
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mã giao dịch
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {depositData.transactionContent}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <img
                    src={depositData.qrImageUrl}
                    alt="QR Code"
                    style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Quét mã QR trên để thanh toán
                  </Typography>
                </Box>

                {/* Hiển thị trạng thái giao dịch */}
                {depositStatus === "pending" && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} />
                      Đang chờ xác nhận thanh toán...
                    </Box>
                  </Alert>
                )}
                {depositStatus === "success" && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Nạp tiền thành công! Số dư của bạn đã được cập nhật.
                  </Alert>
                )}
                {depositStatus === "failed" && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Không nhận được thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleNewTransaction}
                  sx={{ mt: 2 }}
                >
                  Tạo giao dịch mới
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepositForm; 