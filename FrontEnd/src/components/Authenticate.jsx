import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setToken } from "../services/localStorageService";

export default function Authenticate() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    if (isMatch) {
      const authCode = isMatch[1];

      fetch(`http://localhost:8080/auth/outbound/authentication?code=${authCode}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          setToken(data.result?.token);
          setIsLoggedIn(true);
        });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-lg font-semibold text-gray-700">Authenticating...</p>
      </div>
    </div>
  );
}
