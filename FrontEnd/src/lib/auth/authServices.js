import { OAuthConfig } from "../../configurations/configuration";
import { getToken, setToken } from "../../services/localStorageService";
import axios from "axios";

export const handleLogin = async (username, password) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    setToken(data.result?.token); // Lưu token vào localStorage
    return data.result?.token; // Trả về token cho Login.jsx xử lý
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please check your credentials.");
  }
};

export const handleContinueWithGoogle = () => {
  const targetUrl = `${OAuthConfig.authUri}?redirect_uri=${encodeURIComponent(
    OAuthConfig.redirectUri
  )}&response_type=code&client_id=${
    OAuthConfig.clientId
  }&scope=openid%20email%20profile`;

  window.location.href = targetUrl;
};

export async function sendResetPasswordEmail(email) {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
  try {
    const response = await axios.post(`${API_BASE}/api/password/reset-request`, { email });
    return { success: true, message: response.data.result };
  } catch (error) {
    console.error("Reset password error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to send reset email" 
    };
  }
}

export async function verifyResetToken(token) {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
  try {
    const response = await axios.get(`${API_BASE}/api/password/verify-token/${token}`);
    return { success: true, isValid: response.data.result };
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, isValid: false };
  }
}

export async function resetPassword(token, newPassword) {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
  try {
    const response = await axios.post(`${API_BASE}/api/password/reset-confirm`, {
      token,
      newPassword
    });
    return { success: true, message: response.data.result };
  } catch (error) {
    console.error("Password reset error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to reset password" 
    };
  }
}

export const handleSignUp = async (formData) => {
  try {
    const data = new FormData();
    const jsonRequest = {
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthdayDate: formData.birthdayDate,
    };
    data.append(
      "request",
      new Blob([JSON.stringify(jsonRequest)], { type: "application/json" })
    );
    if (formData.avtFile) {
      data.append("avtFile", formData.avtFile);
    }
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/users`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    
    // Store email for verification purposes
    localStorage.setItem("pendingVerificationEmail", formData.username);
    
    return response.data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};
