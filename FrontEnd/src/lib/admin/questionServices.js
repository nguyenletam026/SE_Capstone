import { getToken } from "../../services/localStorageService";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Get all questions
export const getAllQuestions = async () => {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/api/questions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

// Create a new question
export const createQuestion = async (questionData) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw new Error("Failed to create question");
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
};

// Update an existing question
export const updateQuestion = async (questionId, questionData) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/api/questions/${questionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw new Error("Failed to update question");
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (questionId) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/api/questions/${questionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete question");
    }

    return true;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// Get answers for a specific question
export const getAnswersByQuestionId = async (questionId) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/api/questions/${questionId}/answers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch answers");
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw error;
  }
}; 