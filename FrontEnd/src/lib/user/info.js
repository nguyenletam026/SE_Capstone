import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL;

export const fetchUserInfo = async () => {
    const token = getToken();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/myInfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }
  
    return await response.json();
  };