import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true
});

export const vehiclesApi = {
  list: (params) => api.get("/vehicles", { params }).then(r => r.data),
  create: (data) => api.post("/vehicles", data).then(r => r.data),
  get: (id) => api.get(`/vehicles/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/vehicles/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/vehicles/${id}`).then(r => r.data)
};

export const partsApi = {
  list: (params) => api.get("/parts", { params }).then(r => r.data),
  create: (data) => api.post("/parts", data).then(r => r.data),
  get: (id) => api.get(`/parts/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/parts/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/parts/${id}`).then(r => r.data),
  report: () => api.get("/parts/report").then(r => r.data)
};

export const maintenanceApi = {
  list: (params) => api.get("/maintenance", { params }).then(r => r.data),
  create: (data) => api.post("/maintenance", data).then(r => r.data),
  update: (id, data) => api.put(`/maintenance/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/maintenance/${id}`).then(r => r.data),
  report: (params) => api.get("/maintenance/report", { params }).then(r => r.data),
  reminders: (params) => api.get("/maintenance/reminders", { params }).then(r => r.data)
};

export const fuelApi = {
  list: (params) => api.get("/fuel", { params }).then(r => r.data),
  create: (data) => api.post("/fuel", data).then(r => r.data),
  update: (id, data) => api.put(`/fuel/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/fuel/${id}`).then(r => r.data),
  report: (params) => api.get("/fuel/report", { params }).then(r => r.data)
};

export default api;


