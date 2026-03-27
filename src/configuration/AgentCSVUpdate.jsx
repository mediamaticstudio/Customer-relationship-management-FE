import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";

export default function AgentCSVUpdate() {
  const [file, setFile] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch agents (role=AGENT). Adjust query if needed.
    const fetchAgents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/configurations/users/?role=AGENT&page_size=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        });
        const data = res.data;
        const list = data.data || data.results || [];
        setAgents(list.map(u => ({ id: u.id, name: u.asc_name || u.email })));
      } catch (err) {
        // fallback: try without role filter
        try {
          const res = await axios.get(`${API_BASE_URL}/configurations/users/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
          });
          const data = res.data;
          const list = data.data || data.results || [];
          setAgents(list.map(u => ({ id: u.id, name: u.asc_name || u.email })));
        } catch (e) {
          console.error(e);
        }
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
      if (res.data && res.data.status === "success") {
        toast.success(`Updated: ${res.data.updated} | Skipped: ${res.data.skipped}`);
      } else {
        toast.info(res.data.message || "Upload completed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-box">
      <label className="file-input">
        {file ? file.name : "Choose CSV File (Agent updates)"}
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          hidden
        />
      </label>

      <div className="location-selector">
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="location-dropdown"
        >
          <option value="">-- Select Agent (required) --</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.id})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="settings-btn import-btn"
      >
        {loading ? "Uploading..." : "Upload Agent CSV"}
      </button>
    </div>
  );
}
