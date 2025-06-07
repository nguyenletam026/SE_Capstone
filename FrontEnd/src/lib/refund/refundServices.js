import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

// Admin refund services
export const getRefundHistory = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch refund history");
  }

  return response.json();
};

export const getEligibleRefunds = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/eligible`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch eligible refunds");
  }

  return response.json();
};

export const getRefundStatistics = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/statistics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch refund statistics");
  }

  return response.json();
};

export const processRefund = async (paymentId, reason = 'Manual processing by admin') => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/${paymentId}/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error("Failed to process refund");
  }

  return response.json();
};

// User refund services
export const getUserRefundHistory = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user refund history");
  }

  return response.json();
};

export const requestRefund = async (paymentId, reason) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/request/${paymentId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    throw new Error("Failed to request refund");
  }

  return response.json();
};

// Doctor refund-related services
export const getDoctorRefundWarnings = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/doctor/warnings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch doctor refund warnings");
  }

  return response.json();
};

export const getDoctorResponseStats = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/refunds/doctor/response-stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch doctor response statistics");
  }

  return response.json();
};
