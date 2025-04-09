import { OAuthConfig } from "../../configurations/configuration";
import { getToken, setToken } from "../../services/localStorageService";
import axios from "axios";

// 🔐 Đăng nhập
export const handleLogin = async (username, password) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

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

// 🌐 Google OAuth
export const handleContinueWithGoogle = () => {
  const targetUrl = `${OAuthConfig.authUri}?redirect_uri=${encodeURIComponent(
    OAuthConfig.redirectUri
  )}&response_type=code&client_id=${
    OAuthConfig.clientId
  }&scope=openid%20email%20profile`;

  window.location.href = targetUrl;
};

// 📩 Gửi mail reset mật khẩu
export async function sendResetPasswordEmail(email) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📩 Reset link sent to ${email}`);
      resolve({ success: true });
    }, 1500);
  });
}

// 📝 Đăng ký tài khoản
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

    data.append("request", new Blob([JSON.stringify(jsonRequest)], { type: "application/json" }));
    if (formData.avtFile) {
      data.append("avtFile", formData.avtFile);
    }

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/users`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Sign up error:", error);
    alert("Sign up failed. Please try again.");
    throw error;
  }
};
