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
  const dateStr = reportDate.toISOString().split("T")[0];
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
    const dateStr = reportDate.toISOString().split("T")[0];
    
    // We use the helper we already moved here to keep it DRY
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error("No authentication token found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/date/${dateStr}`, {
      method: "GET",
      headers: headers
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to load report: ${response.statusText}`);
    }

    return response.json();
  } catch (err) {
    console.error("Error loading report:", err);
    throw err;
  }
};