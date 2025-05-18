import React from "react";
import DepositForm from "../components/Deposit/DepositForm";
import DepositHistory from "../components/Deposit/DepositHistory";
import { Container, Grid, Box } from "@mui/material";

const DepositPage = () => {
  return (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <DepositForm />
        </Grid>
        <Grid item xs={12}>
          <Box mt={2}>
            <DepositHistory />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DepositPage; 