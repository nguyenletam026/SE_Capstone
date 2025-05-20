import React, { useState, useEffect, useMemo } from "react";
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
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import { 
  Check, 
  Pending, 
  Search, 
  Refresh, 
  FilterList, 
  Today, 
  DateRange,
  AccountBalanceWallet,
  Close,
  FilterAlt,
  Sort,
  KeyboardArrowDown,
  Person,
  Info,
  CheckCircle,
  CalendarMonth,
  CalendarToday,
  CalendarViewWeek,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, parseISO, isWithinInterval } from 'date-fns';

// Styled Components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -5,
    top: -5,
    padding: '0 4px',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 12,
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiTableCell-head': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: '0.875rem',
  },
}));

const FilterButton = styled(Button)(({ selected, theme }) => ({
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  color: selected ? theme.palette.primary.main : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected 
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.action.hover, 0.1),
  },
  fontWeight: selected ? 600 : 400,
  padding: theme.spacing(0.5, 2),
}));

// Date helper functions
const getDateRangeLabel = (range) => {
  const today = new Date();
  
  switch(range) {
    case 'today':
      return 'Hôm nay';
    case 'yesterday':
      return 'Hôm qua';
    case 'thisWeek':
      return 'Tuần này';
    case 'lastWeek':
      return 'Tuần trước';
    case 'thisMonth':
      return 'Tháng này';
    case 'lastMonth':
      return 'Tháng trước';
    case 'custom':
      return 'Tùy chỉnh';
    default:
      return 'Tất cả';
  }
};

const getDateRange = (range) => {
  const today = new Date();
  
  switch(range) {
    case 'today':
      return { start: startOfDay(today), end: endOfDay(today) };
    case 'yesterday':
      const yesterday = subDays(today, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case 'thisWeek':
      return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
    case 'lastWeek':
      const lastWeek = subWeeks(today, 1);
      return { 
        start: startOfWeek(lastWeek, { weekStartsOn: 1 }), 
        end: endOfWeek(lastWeek, { weekStartsOn: 1 }) 
      };
    case 'thisMonth':
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case 'lastMonth':
      const lastMonth = subMonths(today, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    default:
      return { start: null, end: null };
  }
};

const AdminDepositHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtering state
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Sorting
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [sortBy, setSortBy] = useState('createdAt');

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

  // Apply all filters
  useEffect(() => {
    let filtered = [...history];
    
    // Search filter
    if (searchTerm.trim() !== "") {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.username?.toLowerCase().includes(lowercasedFilter)) ||
          (item.transactionContent?.toLowerCase().includes(lowercasedFilter))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      const isCompleted = statusFilter === 'completed';
      filtered = filtered.filter(item => item.completed === isCompleted);
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(item => {
          if (!item.createdAt) return false;
          try {
            const itemDate = new Date(item.createdAt);
            return itemDate >= start && itemDate <= end;
          } catch (err) {
            return false;
          }
        });
      } else {
        const { start, end } = getDateRange(dateRange);
        if (start && end) {
          filtered = filtered.filter(item => {
            if (!item.createdAt) return false;
            try {
              const itemDate = new Date(item.createdAt);
              return itemDate >= start && itemDate <= end;
            } catch (err) {
              return false;
            }
          });
        }
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'amount') {
        valueA = a.amount || 0;
        valueB = b.amount || 0;
      } else if (sortBy === 'createdAt') {
        valueA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valueB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else {
        valueA = a[sortBy] || '';
        valueB = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredHistory(filtered);
    setPage(0);
  }, [searchTerm, history, dateRange, customStartDate, customEndDate, statusFilter, sortOrder, sortBy]);

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
  
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setAnchorEl(null);
  };
  
  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const handleClearFilters = () => {
    setDateRange('all');
    setStatusFilter('all');
    setSearchTerm('');
    setCustomStartDate("");
    setCustomEndDate("");
  };
  
  const handleSortByChange = (field) => {
    setSortBy(field);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "";
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = history.length;
    const completedTransactions = history.filter(item => item.completed).length;
    const pendingTransactions = totalTransactions - completedTransactions;
    
    const totalCompletedAmount = history
      .filter(deposit => deposit.completed)
      .reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    
    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      totalCompletedAmount
    };
  }, [history]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (dateRange !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (searchTerm.trim() !== '') count++;
    return count;
  }, [dateRange, statusFilter, searchTerm]);
  
  // Date range label for display
  const dateRangeLabel = getDateRangeLabel(dateRange);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header and Summary Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight={600} color="primary.dark">
            Lịch sử nạp tiền
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: alpha('#1976d2', 0.1),
                  '&:hover': { bgcolor: alpha('#1976d2', 0.2) },
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <Box
                    sx={{
                      backgroundColor: alpha('#1976d2', 0.1),
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5,
                    }}
                  >
                    <AccountBalanceWallet color="primary" />
                  </Box>
                  <Typography color="textSecondary" variant="body2">
                    Tổng số tiền đã nạp
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {stats.totalCompletedAmount.toLocaleString()} VND
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Từ {stats.completedTransactions} giao dịch hoàn thành
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <Box
                    sx={{
                      backgroundColor: alpha('#2e7d32', 0.1),
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5,
                    }}
                  >
                    <CheckCircle color="success" />
                  </Box>
                  <Typography color="textSecondary" variant="body2">
                    Giao dịch hoàn thành
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {stats.completedTransactions}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {stats.totalTransactions > 0 
                    ? `${((stats.completedTransactions / stats.totalTransactions) * 100).toFixed(1)}% tổng giao dịch`
                    : 'Chưa có giao dịch nào'}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <Box
                    sx={{
                      backgroundColor: alpha('#ed6c02', 0.1),
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5,
                    }}
                  >
                    <Pending color="warning" />
                  </Box>
                  <Typography color="textSecondary" variant="body2">
                    Giao dịch đang xử lý
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="warning.main">
                  {stats.pendingTransactions}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {stats.totalTransactions > 0 
                    ? `${((stats.pendingTransactions / stats.totalTransactions) * 100).toFixed(1)}% tổng giao dịch`
                    : 'Chưa có giao dịch nào'}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <Box
                    sx={{
                      backgroundColor: alpha('#0288d1', 0.1),
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5,
                    }}
                  >
                    <DateRange color="info" />
                  </Box>
                  <Typography color="textSecondary" variant="body2">
                    Tổng số giao dịch
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {stats.totalTransactions}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  {loading ? (
                    <CircularProgress size={14} sx={{ mr: 1 }} />
                  ) : (
                    <Refresh fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật mới nhất
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filters Row */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Tìm kiếm theo tên hoặc mã giao dịch"
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Date Filter */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
              <FilterButton 
                size="small" 
                variant="text" 
                startIcon={<CalendarToday fontSize="small" />}
                selected={dateRange === 'today'}
                onClick={() => setDateRange('today')}
              >
                Hôm nay
              </FilterButton>
              <FilterButton 
                size="small" 
                variant="text" 
                startIcon={<CalendarToday fontSize="small" />}
                selected={dateRange === 'yesterday'}
                onClick={() => setDateRange('yesterday')}
              >
                Hôm qua
              </FilterButton>
              <FilterButton 
                size="small" 
                variant="text" 
                startIcon={<CalendarViewWeek fontSize="small" />}
                selected={dateRange === 'thisWeek'}
                onClick={() => setDateRange('thisWeek')}
              >
                Tuần này
              </FilterButton>
              <FilterButton 
                size="small" 
                variant="text" 
                startIcon={<CalendarViewWeek fontSize="small" />}
                selected={dateRange === 'lastWeek'}
                onClick={() => setDateRange('lastWeek')}
              >
                Tuần trước
              </FilterButton>
              <FilterButton 
                size="small" 
                variant="text" 
                startIcon={<CalendarMonth fontSize="small" />}
                selected={dateRange === 'thisMonth'}
                onClick={() => setDateRange('thisMonth')}
              >
                Tháng này
              </FilterButton>
              <FilterButton 
                size="small" 
                variant="text" 
                startIcon={<CalendarMonth fontSize="small" />}
                selected={dateRange === 'lastMonth'}
                onClick={() => setDateRange('lastMonth')}
              >
                Tháng trước
              </FilterButton>
            </Stack>
          </Grid>

          {/* Advanced Filter Button */}
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<FilterAlt />}
                endIcon={
                  activeFilterCount > 0 ? (
                    <StyledBadge badgeContent={activeFilterCount} color="error">
                      <KeyboardArrowDown />
                    </StyledBadge>
                  ) : <KeyboardArrowDown />
                }
                variant="outlined"
                onClick={handleFilterClick}
                color={activeFilterCount > 0 ? "primary" : "inherit"}
              >
                {activeFilterCount > 0 ? "Bộ lọc hoạt động" : "Thêm bộ lọc"}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Active filter indicators */}
        {activeFilterCount > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {dateRange !== 'all' && (
              <Chip 
                label={`Thời gian: ${dateRangeLabel}`}
                onDelete={() => setDateRange('all')}
                color="primary"
                variant="outlined"
                icon={<DateRange fontSize="small" />}
                size="small"
              />
            )}
            {statusFilter !== 'all' && (
              <Chip 
                label={`Trạng thái: ${statusFilter === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}`}
                onDelete={() => setStatusFilter('all')}
                color="primary"
                variant="outlined"
                icon={statusFilter === 'completed' ? <Check fontSize="small" /> : <Pending fontSize="small" />}
                size="small"
              />
            )}
            {activeFilterCount > 1 && (
              <Button 
                size="small" 
                onClick={handleClearFilters}
                sx={{ ml: 1 }}
              >
                Xóa tất cả bộ lọc
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: { maxWidth: 340, p: 1, mt: 1 },
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Lọc theo trạng thái
        </Typography>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem 
          selected={statusFilter === 'all'} 
          onClick={() => {
            setStatusFilter('all');
            handleFilterClose();
          }}
        >
          <ListItemIcon>
            <FilterList fontSize="small" />
          </ListItemIcon>
          <ListItemText>Tất cả trạng thái</ListItemText>
        </MenuItem>
        <MenuItem 
          selected={statusFilter === 'completed'} 
          onClick={() => {
            setStatusFilter('completed');
            handleFilterClose();
          }}
        >
          <ListItemIcon>
            <Check fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Đã hoàn thành</ListItemText>
        </MenuItem>
        <MenuItem 
          selected={statusFilter === 'pending'} 
          onClick={() => {
            setStatusFilter('pending');
            handleFilterClose();
          }}
        >
          <ListItemIcon>
            <Pending fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Đang xử lý</ListItemText>
        </MenuItem>

        <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1, mt: 1 }}>
          Thời gian tùy chỉnh
        </Typography>
        <Divider sx={{ my: 0.5 }} />
        
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                fullWidth
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                fullWidth
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              size="small" 
              onClick={() => {
                setCustomStartDate("");
                setCustomEndDate("");
              }}
              disabled={!customStartDate && !customEndDate}
            >
              Đặt lại
            </Button>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => {
                if (customStartDate && customEndDate) {
                  setDateRange('custom');
                  handleFilterClose();
                }
              }}
              disabled={!customStartDate || !customEndDate}
            >
              Áp dụng
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleClearFilters}>
          <ListItemIcon>
            <Close fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xóa tất cả bộ lọc</ListItemText>
        </MenuItem>
      </Menu>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && filteredHistory.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredHistory.length === 0 ? (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: alpha('#42a5f5', 0.1)
          }}
        >
          <Info sx={{ fontSize: 48, color: 'info.main', opacity: 0.6, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Không tìm thấy giao dịch nào
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {activeFilterCount > 0 
              ? 'Thay đổi hoặc xóa bộ lọc để xem thêm kết quả'
              : 'Chưa có giao dịch nạp tiền nào được thực hiện'}
          </Typography>
          {activeFilterCount > 0 && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Xóa tất cả bộ lọc
            </Button>
          )}
        </Paper>
      ) : (
        <Paper sx={{ width: "100%", borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={500}>
              {filteredHistory.length} giao dịch được tìm thấy
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Sắp xếp theo">
                <Button 
                  endIcon={<KeyboardArrowDown />}
                  size="small"
                  color="inherit"
                  onClick={(e) => {
                    const sortMenu = document.getElementById('sort-menu');
                    if (sortMenu) {
                      sortMenu.style.display = sortMenu.style.display === 'block' ? 'none' : 'block';
                    }
                  }}
                >
                  Sắp xếp: {sortBy === 'amount' ? 'Số tiền' : sortBy === 'createdAt' ? 'Ngày tạo' : 'Mặc định'}
                </Button>
              </Tooltip>
              <Box 
                id="sort-menu" 
                sx={{ 
                  position: 'absolute', 
                  right: 10, 
                  top: 'calc(100% + 5px)', 
                  zIndex: 1000,
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                  borderRadius: 1,
                  p: 1,
                  display: 'none'
                }}
              >
                <MenuItem dense onClick={() => handleSortByChange('createdAt')}>
                  <ListItemIcon>
                    {sortBy === 'createdAt' && <Check fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText>Ngày tạo</ListItemText>
                </MenuItem>
                <MenuItem dense onClick={() => handleSortByChange('amount')}>
                  <ListItemIcon>
                    {sortBy === 'amount' && <Check fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText>Số tiền</ListItemText>
                </MenuItem>
              </Box>
              <Tooltip title={`Sắp xếp ${sortOrder === 'asc' ? 'tăng dần' : 'giảm dần'}`}>
                <IconButton size="small" onClick={handleSortToggle}>
                  <Sort 
                    fontSize="small" 
                    sx={{ 
                      transform: sortOrder === 'asc' ? 'none' : 'rotate(180deg)',
                      transition: 'transform 0.3s'
                    }} 
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="deposit history table">
              <StyledTableHead>
                <TableRow>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Mã giao dịch</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="right">Ngày tạo</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {filteredHistory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((deposit) => (
                    <TableRow 
                      key={deposit?.id || Math.random()}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                          <Typography variant="body2">{deposit?.username || ""}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{deposit?.transactionContent || ""}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={500} color={deposit?.completed ? 'success.main' : 'text.primary'}>
                          {(deposit?.amount || 0).toLocaleString()} VND
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {deposit?.completed ? (
                          <Chip
                            icon={<Check fontSize="small" />}
                            label="Hoàn thành"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 110 }}
                          />
                        ) : (
                          <Chip
                            icon={<Pending fontSize="small" />}
                            label="Đang xử lý"
                            color="warning"
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 110 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatDate(deposit?.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AdminDepositHistory;