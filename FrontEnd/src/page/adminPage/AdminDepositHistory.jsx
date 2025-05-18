import React from "react";
import AdminLayout from "../../components/layouts/adminLayout";
import AdminDepositHistoryComponent from "../../components/Admin/AdminDepositHistory";
import { Box } from "@mui/material";

const AdminDepositHistory = () => {
  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <AdminDepositHistoryComponent />
      </Box>
    </AdminLayout>
  );
};

export default AdminDepositHistory; 