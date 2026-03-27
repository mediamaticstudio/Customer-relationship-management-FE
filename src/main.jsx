import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

// Global Interceptor for all API calls
axios.interceptors.request.use((config) => {
  // Add Cache Buster for GET requests
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: new Date().getTime(),
    };
  }

  // Add Dynamic Database Selection Header
  const selectedDb = localStorage.getItem("selected_db") || "default";
  config.headers['X-DB-Name'] = selectedDb;

  // Add Authorization Token if available
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor to handle unintended 401s (token expire/invalid)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear data and redirect to login
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("role");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);


import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <BrowserRouter basename="/">
    <App />
  </BrowserRouter>
  // {/* </React.StrictMode> */}
);



