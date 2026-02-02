import React, { useState } from "react";
import { toast } from "react-toastify";
import "../styles/ForgotPassword.css";
import { API_BASE_URL } from "../config.jsx";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          "Reset link sent successfully! 📩 Please check your email to continue."
        );
        setEmail("");
      } else {
        setError(data.message || "Something went wrong. Try again.");
        toast.error(data.message || "Failed to send reset link");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
      toast.error("Server error. Please try again later.", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form onSubmit={submitEmail} className="forgot-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">
          Enter your registered email address and we’ll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};
