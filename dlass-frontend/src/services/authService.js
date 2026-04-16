import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "./apiUtils";

const API_URL = API_BASE_URL;

// ─── Token helpers ───────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserRole() {
  return localStorage.getItem("role");
}

export function getUsername() {
  return localStorage.getItem("email");
}

export function isTokenExpired() {
  const token = getToken();
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({ baseURL: API_URL });

// Request interceptor – attach JWT
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { api };

// ─── Auth API calls ───────────────────────────────────────────────────────────

export async function login(email, password) {
  const response = await api.post("/api/auth/login", { email, password });
  const { token, email: userEmail, role } = response.data;

  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("email", userEmail);

  return response.data;
}

export async function register(userData) {
  const response = await api.post("/api/users", userData);
  return response.data;
}

// ─── App-level token guard (call from App.jsx on mount) ──────────────────────

export function checkAndClearExpiredToken() {
  if (isTokenExpired()) {
    logout();
    return false;
  }
  return true;
}
