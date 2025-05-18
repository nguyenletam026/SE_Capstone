import React, { useState, useEffect } from "react";
import { getAllDepositHistory } from "../../lib/user/depositServices";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Check, Pending, Search, Refresh } from "@mui/icons-material";

const AdminDepositHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAllDepositHistory();
      setHistory(data);
      setFilteredHistory(data);
    } catch (err) {
      setError("Không thể tải lịch sử nạp tiền. Vui lòng thử lại sau.");
      console.error("Error fetching deposit history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredHistory(history);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = history.filter(
        (item) =>
          item.username.toLowerCase().includes(lowercasedFilter) ||
          item.transactionContent.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredHistory(filtered);
    }
    setPage(0);
  }, [searchTerm, history]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchHistory();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Calculate total amount of completed deposits
  const totalCompletedAmount = history
    .filter((deposit) => deposit.completed)
    .reduce((sum, deposit) => sum + deposit.amount, 0);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h1">
          Lịch sử nạp tiền
        </Typography>
        <IconButton onClick={handleRefresh} color="primary" title="Làm mới">
          <Refresh />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          label="Tìm kiếm theo tên người dùng hoặc mã giao dịch"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "50%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Tổng số tiền đã nạp: {totalCompletedAmount.toLocaleString()} VND
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredHistory.length === 0 ? (
        <Alert severity="info">Không có dữ liệu nạp tiền nào.</Alert>
      ) : (
        <Paper sx={{ width: "100%" }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="deposit history table">
              <TableHead>
                <TableRow>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Mã giao dịch</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="right">Ngày tạo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell>{deposit.username}</TableCell>
                      <TableCell>{deposit.transactionContent}</TableCell>
                      <TableCell align="right">
                        {deposit.amount.toLocaleString()} VND
                      </TableCell>
                      <TableCell align="center">
                        {deposit.completed ? (
                          <Chip
                            icon={<Check />}
                            label="Hoàn thành"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Pending />}
                            label="Đang xử lý"
                            color="warning"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatDate(deposit.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang"
          />
        </Paper>
      )}
    </Box>
  );
};

export default AdminDepositHistory; 