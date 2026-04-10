import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";
import { FiUpload, FiRefreshCcw, FiUser } from "react-icons/fi";

export default function AgentCSVUpdate() {
  const [file, setFile] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/configurations/users/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        });
        const list = res.data.data || res.data.results || [];
        setAgents(list.map(u => ({ id: u.id, name: u.asc_name || u.email })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgents();
  }, []);

  const handleUpload = async () => {
    if (!assignedTo) return toast.error("Select an agent before uploading");
    if (!file) return toast.error("Choose a CSV file to upload");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assigned_to", assignedTo);

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/configurations/leads/agent-csv-update/`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      toast.success(res.data.status === "success" ? `Updated: ${res.data.updated}` : "Upload completed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-box">
      <div className="location-selector">
        <label htmlFor="agent-select">Target Agent</label>
        <select
          id="agent-select"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="location-dropdown"
        >
          <option value="">-- Select Agent --</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <label className="file-input">
        <FiUpload style={{ marginRight: '10px' }} />
        {file ? file.name : "Choose CSV Update File"}
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          hidden
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="settings-btn"
      >
        {loading ? <FiRefreshCcw className="spinning" /> : <FiUser />}
        {loading ? "Syncing..." : "Update Agent Logs"}
      </button>
    </div>
  );
}
