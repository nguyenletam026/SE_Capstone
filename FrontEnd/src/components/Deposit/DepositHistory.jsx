import React, { useState, useEffect } from "react";
import { getUserDepositHistory } from "../../lib/user/depositServices";
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
} from "@mui/material";
import { Check, Pending } from "@mui/icons-material";

const DepositHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getUserDepositHistory();
        setHistory(data);
      } catch (err) {
        setError("Không thể tải lịch sử nạp tiền. Vui lòng thử lại sau.");
        console.error("Error fetching deposit history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
        Lịch sử nạp tiền
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : history.length === 0 ? (
        <Alert severity="info">Bạn chưa có giao dịch nạp tiền nào.</Alert>
      ) : (
        <Paper sx={{ width: "100%" }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="deposit history table">
              <TableHead>
                <TableRow>
                  <TableCell>Mã giao dịch</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="right">Ngày tạo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell component="th" scope="row">
                        {deposit.transactionContent}
                      </TableCell>
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
                            label="Đã hết hạn"
                            color="error"
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={history.length}
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

export default DepositHistory; 