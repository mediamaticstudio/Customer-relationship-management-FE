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
          `${API_BASE_URL}/api/token/refresh/`,
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
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
