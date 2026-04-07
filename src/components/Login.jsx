import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa"; // Added FaSpinner for loading
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import Logo from "../assets/download.png";
import quotes from "../data/Quotes.json";
import "../styles/Login.css";
import { API_BASE_URL as GLOBAL_API_BASE_URL } from "../config.jsx";

// Constants for better maintainability
const API_BASE_URL = GLOBAL_API_BASE_URL;
const LOGIN_ENDPOINT = "/auth/login/";
const TOAST_DURATION = 800;

// Helper function to determine redirect path based on role
const getRedirectPath = (role) => {
  const upperRole = role?.toUpperCase();
  // Agents and Supervisors go to assigned page, admins/superadmins go to dashboard
  return (upperRole === "AGENT" || upperRole === "SUPERVISOR") ? "/assigned" : "/dashboard";
};

/**
 * Login component for user authentication.
 * Handles email/password login with token storage and redirection.
 */
export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [emailError, setEmailError] = useState(""); // For client-side validation

  const navigate = useNavigate();

  // Memoize random quote to avoid recalculation on re-renders
  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, []);

  // Check for existing token on mount and redirect if authenticated
  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");
    if (token) {
      navigate(getRedirectPath(role));
    }
  }, [navigate]);

  // Basic email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission with improved error handling
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");

    // Client-side validation
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
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
          email: trimmedEmail,
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
        localStorage.setItem("email", trimmedEmail);
        localStorage.setItem("selected_db", data.data.db_silo || "default");
        localStorage.setItem("userName", data.data.asc_name);
        localStorage.setItem("is_asc_view", "false");

        toast.success(`Welcome back!`, {
          icon: "👋",
        });

        setTimeout(() => {
          navigate(getRedirectPath(data.data.role));
        }, TOAST_DURATION);
      } else {
        // Handle specific error messages from server
        const errorMessage = data.message || "Login failed. Please check your credentials.";
        toast.error(errorMessage);
      }
    } catch (error) {
      // Handle network or unexpected errors
      toast.error("Network error. Please check your connection and try again.", error.message);
      // In production, log to a service instead of console
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  return (
    <div className="login-page">
      {/* LEFT BRAND PANEL */}
      <div className="brand-panel">
        <div className="brand-overlay"></div>
        <div className="brand-content">
          <div className="logo-container">
            <div className="logo-glow">
              <img src={Logo} alt="Mediamatic Studio Logo" className="logo-img" />
            </div>
            <h2 className="company-name"><span>Mediamatic Studio</span>
              <p className="company-tagline">Enterprise CRM Solution</p>
            </h2>
          </div>

          <div className="quote-container">
            {/* <div className="quote-icon" aria-hidden="true">❝</div> */}
            <h1 className="quote-title">{quote.title}</h1>
            <p className="quote-content">{quote.content}</p>
          </div>

          <div className="brand-footer">
            <p>Trusted by leading enterprises worldwide</p>
            <div className="security-badge">
              🔒 SSL Secured • GDPR Compliant
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="form-panel">
        <div className="form-container">


          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="input-group">
              <label htmlFor="email">
                <FiMail className="input-icon" aria-hidden="true" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(""); // Clear error on change
                }}
                required
                className={`form-input ${emailError ? "error" : ""}`}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && <span id="email-error" className="error-message" role="alert">{emailError}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password">
                <FiLock className="input-icon" aria-hidden="true" />
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              aria-describedby="login-status"
            >
              {loading && <FaSpinner className="spinner" aria-hidden="true" />}
              <span id="login-status">{loading ? "Signing in..." : "Sign In"}</span>
              {!loading && <FiArrowRight className={`btn-arrow ${isHovering ? 'hover' : ''}`} aria-hidden="true" />}
            </button>

            <div className="form-footer">
              <p>
                Need help?{" "}
                <Link to="/support" className="support-link">
                  Contact Support
                </Link>
              </p>
              <p className="copyright">© 2025 Mediamatic Studio CRM • v2.1.0</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};