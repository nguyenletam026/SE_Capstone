import { getToken } from "../../services/localStorageService";

const API_URL = process.env.REACT_APP_API_URL;

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};