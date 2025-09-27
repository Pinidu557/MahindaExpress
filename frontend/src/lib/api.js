import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to handle errors gracefully
api.interceptors.request.use(
  (config) => {
    // You can add any auth tokens here if needed
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
