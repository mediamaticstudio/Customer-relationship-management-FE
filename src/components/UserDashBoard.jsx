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
} from "react-icons/fi";

const API_URL = `${API_BASE_URL}/crm/leads/count/`;

export default function UserDashboard() {
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

  return (
    <div className="dashboard-layout">
      {role !== "AGENT" && <Sidebar />}

      <main className="dashboard-main">
        {/* DATE FILTER */}
        <div className="dashboard-filter">
          <div>
            <label>Single Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => applySingleDate(e.target.value)}
            />
          </div>

          <div>
            <label>From</label>
            <input type="date" onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div>
            <label>To</label>
            <input type="date" onChange={(e) => setTo(e.target.value)} />
          </div>

          <button onClick={applyRange}>Apply Range</button>
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
