import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";
import { FiUpload, FiLayers, FiRefreshCcw } from "react-icons/fi";

export default function ImportLeads() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [selectedLanguage, setSelectedLanguage] = useState("General");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/configurations/asc-filters/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (response.data.status === "success") {
          setLocations(response.data.data.asc_locations || []);
        }
      } catch (error) {
        console.error("Error fetching locations", error);
      }
    };
    fetchLocations();
  }, []);

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV or Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (selectedLocation) {
      formData.append("asc_location", selectedLocation);
    }
    formData.append("language", selectedLanguage);

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/configurations/leads/import-csv/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      const data = response.data;

      if (response.status === 201 || response.status === 200) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Import error", error);
      toast.error(error.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const languages = ["General", "Tamil", "Malayalam", "Kannada", "Telugu", "Hindi", "English"];

  return (
    <div className="import-box">
      <div className="location-selector">
        <label htmlFor="language-select">Target Language</label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="location-dropdown"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <label className="file-input">
        <FiUpload style={{ marginRight: '10px' }} />
        {file ? file.name : "Choose CSV / Excel File"}
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={(e) => setFile(e.target.files[0])}
          hidden
        />
      </label>

      <button
        onClick={handleImport}
        disabled={loading}
        className="settings-btn"
      >
        {loading ? <FiRefreshCcw className="spinning" /> : <FiLayers />}
        {loading ? "Importing..." : "Import Leads"}
      </button>
    </div>
  );
}
