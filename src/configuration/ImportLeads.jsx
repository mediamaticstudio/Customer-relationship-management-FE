import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";


export default function ImportLeads({ file, setFile }) {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/configurations/leads/import-csv/`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();


      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Import error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-box">
      <label className="file-input">
        Choose CSV File
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          hidden
        />
      </label>

      <button
        onClick={handleImport}
        disabled={loading}
        className="settings-btn import-btn"
      >
        {loading ? "Importing..." : "Import CSV"}
      </button>
    </div>

  );
}
