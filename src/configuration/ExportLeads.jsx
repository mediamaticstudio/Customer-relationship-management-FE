import React, { useState } from "react";
import axiosInstance from "./axiosInstance";
import { toast } from "react-toastify";


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
      console.error("CSV export failed:", error);
      toast.error("CSV export failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="settings-btn import-btn"
    >
      {loading ? "Exporting..." : "Export CSV"}
    </button>

  );
};

export default ExportLeads;
