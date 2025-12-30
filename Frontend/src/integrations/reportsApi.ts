// src/integrations/reportsApi.ts

const API_BASE_URL = "http://localhost:5000/api/daily-reports";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const saveReportToDB = async (reportData: any) => {
  const response = await fetch(`${API_BASE_URL}/save`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to save report" }));
    throw new Error(error.message || "Failed to save report");
  }
  
  return response.json();
};

export const submitReportToDB = async (projectName: string, reportDate: Date) => {
  const year = reportDate.getFullYear();
  const month = String(reportDate.getMonth() + 1).padStart(2, '0');
  const day = String(reportDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`; 

  // DEBUG 1: Verify what string we are sending
  console.log("DEBUG FRONTEND: Sending to API ->", { projectName, dateStr });

  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectName, date: dateStr }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to submit report" }));
    throw new Error(error.message || "Failed to submit report");
  }

  return response.json();
};

export const loadReportFromDB = async (reportDate: Date) => {
  try {
    // FIX: Instead of toISOString(), manually build the YYYY-MM-DD string
    // This ensures Dec 29 stays Dec 29 regardless of your timezone offset.
    const year = reportDate.getFullYear();
    const month = String(reportDate.getMonth() + 1).padStart(2, '0');
    const day = String(reportDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`; 

    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error("No authentication token found. Please log in.");
    }

    // Now this URL will correctly be .../date/2025-12-29
    const response = await fetch(`${API_BASE_URL}/date/${dateStr}`, {
      method: "GET",
      headers: headers
    });

    const data = await response.json();
    // If the backend is sending the new { report, historyMap } structure:
    if (data && typeof data === 'object' && 'report' in data) {
      return data; // Return the whole package
    }

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to load report: ${response.statusText}`);
    }

    return data; // Fallback for older data structures
  } catch (err) {
    console.error("Error loading report:", err);
    throw err;
  }
};