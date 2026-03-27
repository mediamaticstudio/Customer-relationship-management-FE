import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import StatCard from "./StatCard";
import "../styles/UserDashboard.css";

import {
  FiPhoneCall,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiDollarSign,
  FiRotateCcw
} from "react-icons/fi";

const API_URL = `${API_BASE_URL}/crm/leads/count/`;

export default function UserDashboard({ setToday, actionButtons }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  const today = new Date().toISOString().split("T")[0];

  const [stats, setStats] = useState({});
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    fetchStats({ date: today });
  }, []);

  const fetchStats = async (params = {}) => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard error", err);
    }
  };

  const applySingleDate = (val) => {
    setDate(val);
    setFrom("");
    setTo("");
    fetchStats({ date: val });
  };

  const applyRange = () => {
    if (from && to) fetchStats({ from, to });
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    fetchStats({ date: today });
  };

  return (
    <div className="dashboard-layout">
      {role !== "AGENT" && <Sidebar />}

      <main className="dashboard-main">
        {/* DASHBOARD HEADER WITH FILTERS AND ACTIONS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
          <div>
            <label style={{ fontSize: "0.68rem", fontWeight: "800", color: "#6C3A39", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8, marginBottom: "10px", display: "block" }}>
              Date Range
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              
              {/* Range Selector */}
              <div style={{ display: "flex", alignItems: "center", background: "#f3ede3", padding: "0 14px", height: "42px", borderRadius: "8px", border: "1px solid #e8e0d0" }}>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.85rem", color: "#333", cursor: "pointer", height: "100%" }}
                />
                <span style={{ margin: "0 12px", color: "#888", fontSize: "1rem", display: "flex", alignItems: "center" }}>→</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.85rem", color: "#333", cursor: "pointer", height: "100%" }}
                />
              </div>

              <button
                onClick={applyRange}
                style={{ background: "#4e1a1e", color: "#fff", border: "none", borderRadius: "8px", padding: "0 20px", height: "42px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", display: "flex", alignItems: "center" }}
              >
                Apply Range
              </button>

              <button
                onClick={handleReset}
                title="Reset Date Range"
                style={{ 
                  background: "#f3ede3", color: "#6C3A39", border: "1px solid #e8e0d0", 
                  borderRadius: "8px", padding: "0 14px", height: "42px", display: "flex", alignItems: "center", 
                  cursor: "pointer", transition: "all 0.2s" 
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#eadecf"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f3ede3"; }}
              >
                <FiRotateCcw size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", height: "42px" }}>
            {actionButtons}
          </div>
        </div>

        {/* DASHBOARD CARDS */}
        <div className="dashboard-grid">

          <StatCard
            title="Total Calls"
            value={stats.total_calls}
            icon={<FiPhoneCall />}
          />

          <StatCard
            title="Total Connects"
            value={stats.total_connects}
            icon={<FiCheckCircle />}
            onClick={() => navigate("/assigned?connect=true")}
          />

          <StatCard
            title="Non Connects"
            value={stats.total_non_connects}
            icon={<FiXCircle />}
          />

          <StatCard
            title="Non Valid"
            value={stats.total_non_valid}
            icon={<FiUsers />}
          />

          <StatCard
            title="Follow Ups"
            value={stats.total_followups}
            icon={<FiClock />}
            onClick={() => navigate("/assigned?status=followup")}
          />

          <StatCard
            title="Prospects"
            value={stats.total_prospects}
            icon={<FiTrendingUp />}
            onClick={() => navigate("/assigned?status=prospect")}
          />

          <StatCard
            title="Sales"
            value={stats.total_sales}
            icon={<FiDollarSign />}
            onClick={() => navigate("/assigned?status=deal-won")}
          />

        </div>
      </main>
    </div>
  );
}
