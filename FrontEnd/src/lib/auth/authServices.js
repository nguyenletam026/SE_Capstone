import { OAuthConfig } from "../../configurations/configuration";
export const handleLogin = async (username, password, setToken, navigate) => {
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
      setToken(data.result?.token);
      navigate("/");
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