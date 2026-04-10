import React, { useState } from "react";
import axiosInstance from "./axiosInstance";
import { toast } from "react-toastify";
import { FiDownload, FiRefreshCcw } from "react-icons/fi";

const ExportLeads = () => {
  const [loading, setLoading] = useState(false);
  const [fileNameInput, setFileNameInput] = useState("");

  const handleExport = async () => {
    const fileName = fileNameInput.trim();
    
    if (!fileName) {
      toast.error("Please enter a file name");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/configurations/leads/export-csv/",
        {
          responseType: "blob",
          params: { filename: fileName },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("CSV export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-box" style={{ height: '100%', justifyContent: 'space-between' }}>
      <div className="location-selector" style={{ marginBottom: '20px' }}>
        <label className="premium-label">FILE NAME</label>
        <input
          type="text"
          placeholder="Enter file name"
          className="premium-input"
          value={fileNameInput}
          onChange={(e) => setFileNameInput(e.target.value)}
        />
      </div>
      <button
        onClick={handleExport}
        disabled={loading || !fileNameInput.trim()}
        className="settings-btn" id="export-btn"
      >
        {loading ? <FiRefreshCcw className="spinning" /> : <FiDownload />}
        {loading ? "Preparing..." : "Export Lead Data"}
      </button>
    </div>
  );
};

export default ExportLeads;
