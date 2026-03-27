import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";

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
    <div className="import-box" style={{ gap: '12px' }}>
      <div className="location-selector" style={{ marginBottom: 0 }}>
        {/* <label htmlFor="location-select">SELECT AGENT LOCATION:</label> */}
        {/* <select
          id="location-select"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="location-dropdown"
        >
          <option value="">-- All Locations (Default) --</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select> */}
      </div>

      <div className="location-selector" style={{ marginBottom: '10px' }}>
        <label htmlFor="language-select">SELECT LANGUAGE:</label>
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
        className="settings-btn import-btn"
      >
        {loading ? "Importing..." : "Import File"}
      </button>
    </div>
  );
}
