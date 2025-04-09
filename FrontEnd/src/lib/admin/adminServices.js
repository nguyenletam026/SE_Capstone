import { getToken } from "../../services/localStorageService";

const API_URL = process.env.REACT_APP_API_URL;

export const getRoles = async () => {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch roles");
    }
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await fetch(`${API_URL}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(roleData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const updateRole = async (roleName, updatedData) => {
  try {
    const response = await fetch(`${API_URL}/roles/${roleName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(updatedData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

export const deleteRole = async (roleName) => {
  try {
    const response = await fetch(`${API_URL}/roles/${roleName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};
