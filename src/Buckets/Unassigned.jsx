import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Buckets.css";
import { API_BASE_URL } from "../config.jsx";

export const BulkAssign = ({ leadIds, onSuccess }) => {
  const [agents, setAgents] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/auth/userlist/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => setAgents(res.data.data || []));
  }, []);

  const handleAssign = async (agentId) => {
    if (!agentId || leadIds.length === 0) return;

    setAssigning(true);
    try {
      await axios.post(
        `${API_BASE_URL}/crm/leads/`,
        {
          lead_ids: leadIds, // ✅ ARRAY
          agent_id: agentId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <select
      className="assign-dropdown"
      defaultValue=""
      disabled={assigning}
      onChange={(e) => handleAssign(e.target.value)}
    >
      <option value="" disabled>
        Assign selected ({leadIds.length})
      </option>
      {agents.map((agent) => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
    </select>
  );
};
