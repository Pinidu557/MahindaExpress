// Admin authentication utilities

// Get admin token from localStorage
export const getAdminToken = () => {
  return localStorage.getItem("adminToken");
};

// Get admin data from localStorage
export const getAdminData = () => {
  const adminData = localStorage.getItem("adminData");
  return adminData ? JSON.parse(adminData) : null;
};

// Set admin token and data in localStorage
export const setAdminAuth = (token, adminData) => {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminData", JSON.stringify(adminData));
};

// Clear admin authentication data
export const clearAdminAuth = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminData");
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  const adminData = getAdminData();
  return !!(token && adminData);
};

// Get authorization header for API requests
export const getAdminAuthHeader = () => {
  const token = getAdminToken();
  return token ? `Bearer ${token}` : null;
};
