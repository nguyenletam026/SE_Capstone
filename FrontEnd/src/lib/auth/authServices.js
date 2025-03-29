import { OAuthConfig } from "../../configurations/configuration";
import { getToken, setToken } from "../../services/localStorageService";

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


  
  export const handleContinueWithGoogle = () => {
    const targetUrl = `${OAuthConfig.authUri}?redirect_uri=${encodeURIComponent(
      OAuthConfig.redirectUri
    )}&response_type=code&client_id=${
      OAuthConfig.clientId
    }&scope=openid%20email%20profile`;
  
    window.location.href = targetUrl;
  };

  export async function sendResetPasswordEmail(email) {
    // Giả lập gửi mail với delay 1.5s
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📩 Reset link sent to ${email}`);
        resolve({ success: true });
      }, 1500);
    });
  }
  