import React, { useState } from "react";
import axiosInstance from "./axiosInstance";
import { toast } from "react-toastify";
import { FiDownload, FiRefreshCcw } from "react-icons/fi";

const ExportLeads = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const fileName = prompt("Enter file name", "leads");
    if (!fileName) return;

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
    <>
      <div className="location-selector">
        <label className="field-label">FILE NAME</label>
        <input
          type="text"
          placeholder="Enter file name"
          className="input"
        />
      </ div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="settings-btn" id="export-btn"
      >
        {loading ? <FiRefreshCcw className="spinning" /> : <FiDownload />}
        {loading ? "Preparing..." : "Export Lead Data"}
      </button></>
  );
};

export default ExportLeads;
