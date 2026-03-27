import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/ResetPassword.css";
import { API_BASE_URL } from "../config.jsx";

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/reset-password/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DB-Name": localStorage.getItem("selected_db") || "default"
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successfully. Please login.");
        navigate("/");
      } else {
        setError(data.message || "Reset failed");
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      toast.error("Server error. Please try again.", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <form onSubmit={resetPassword} className="reset-card">
        <h2>Reset Password</h2>
        <p className="subtitle">
          Enter your new password below to secure your account.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};
