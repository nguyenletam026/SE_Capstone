// services/stressServices.js

export async function fetchMonthlyStress() {
    try {
      const response = await fetch("http://localhost:8080/api/stress/monthly");
      const data = await response.json();
      return data.result[0]?.stress_analyses || [];
    } catch (error) {
      console.error("Error fetching stress data:", error);
      return [];
    }
  }
  