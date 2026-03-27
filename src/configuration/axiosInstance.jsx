import axios from "axios";
import { API_BASE_URL } from "../config.jsx";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Dynamic Database Selection Header
    const selectedDb = localStorage.getItem("selected_db") || "default";
    config.headers['X-DB-Name'] = selectedDb;

    // Cache buster for GET requests
    if (config.method === 'get') {
      config.params = { ...config.params, _t: new Date().getTime() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          {
            refresh: localStorage.getItem("refresh"),
          }
        );

        localStorage.setItem("access", res.data.access);
        originalRequest.headers.Authorization =
          `Bearer ${res.data.access}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
