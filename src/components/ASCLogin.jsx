import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"; 
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import Logo from "../assets/download.png";
import quotes from "../data/Quotes.json";
import "../styles/Login.css";
import { API_BASE_URL as GLOBAL_API_BASE_URL } from "../config.jsx";

const API_BASE_URL = GLOBAL_API_BASE_URL;
const LOGIN_ENDPOINT = "/auth/asc-login-api/";
const TOAST_DURATION = 800;

/**
 * ASCLogin component for Authorized Service Center authentication.
 * Redirects specifically to ASC Performance page on success.
 */
export const ASCLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const navigate = useNavigate();

  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
        const asc_code = localStorage.getItem("asc_code");
        const asc_location = localStorage.getItem("asc_location");
        if (asc_code && asc_location) {
            navigate(`/reports/asc-performance?code=${asc_code}&location=${asc_location}`);
        } else {
            navigate("/dashboard");
        }
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setUsernameError("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedUsername) {
      setUsernameError("User ID is required.");
      setLoading(false);
      return;
    }
    if (!trimmedPassword) {
      toast.error("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens securely
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("role", data.data.role);
        localStorage.setItem("asc_code", data.data.asc_code);
        localStorage.setItem("user_id", data.data.user_id);
        localStorage.setItem("asc_location", data.data.asc_location);
        localStorage.setItem("username", trimmedUsername);
        localStorage.setItem("selected_db", data.data.db_silo || "default");
        localStorage.setItem("userName", data.data.asc_name);
        localStorage.setItem("is_asc_view", "true");

        toast.success(`Welcome back, ${data.data.asc_name}!`, {
          icon: "👋",
        });

        setTimeout(() => {
          navigate(`/reports/asc-performance?code=${data.data.asc_code}&location=${data.data.asc_location}`);
        }, TOAST_DURATION);
      } else {
        const errorMessage = data.message || "Login failed. Please check your credentials.";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate]);

  return (
    <div className="login-page">
      <div className="brand-panel">
        <div className="brand-overlay"></div>
        <div className="brand-content">
          <div className="logo-container">
            <div className="logo-glow">
              <img src={Logo} alt="Logo" className="logo-img" />
            </div>
            <h2 className="company-name"><span>Mediamatic Studio</span>
              <p className="company-tagline">ASC Performance Portal</p>
            </h2>
          </div>

          <div className="quote-container">
            <h1 className="quote-title">{quote.title}</h1>
            <p className="quote-content">{quote.content}</p>
          </div>

          <div className="brand-footer">
            <p>Authorized Service Center Access Only</p>
            <div className="security-badge">
              🔒 SSL Secured • Enterprise Grade
            </div>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-container">
          <div className="form-header">
            <h2>ASC Login</h2>
            <p className="subtitle">Access your performance metrics and reports</p>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="input-group">
              <label htmlFor="username">
                <FiMail className="input-icon" />
                ASC User ID
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter ASC User ID"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                required
                className={`form-input ${usernameError ? "error" : ""}`}
              />
              {usernameError && <span className="error-message">{usernameError}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password">
                <FiLock className="input-icon" />
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <Link to="/forgot-password" style={{ color: "var(--primary-dark)", textDecoration: "none", fontSize: "0.85rem" }}>
                Forgot Password?
              </Link>
            </div>

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {loading && <FaSpinner className="spinner" />}
              <span>{loading ? "Verifying..." : "View Performance"}</span>
              {!loading && <FiArrowRight className={`btn-arrow ${isHovering ? 'hover' : ''}`} />}
            </button>

            <div className="form-footer">
              <p>
                Having trouble?{" "}
                <Link to="/support" className="support-link">
                  Support
                </Link>
              </p>
              <p className="copyright">© 2025 Mediamatic Studio • ASC Portal</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
