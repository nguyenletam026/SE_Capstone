import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

export const getCurrentBalance = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/deposits/balance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get current balance");
  }

  return response.json();
};

export const createDeposit = async (amount) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/deposits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    throw new Error("Failed to create deposit request");
  }

  return response.json();
};

export const checkDepositStatus = async (transactionContent) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/deposits/status/${transactionContent}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to check deposit status");
  }

  return response.json();
}; 