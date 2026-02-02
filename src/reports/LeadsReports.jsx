import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFilter, FiDownload } from "react-icons/fi";
import Select from "react-select";
import "../styles/Reports.css";

import { API_BASE_URL } from "../config.jsx";

const API = `${API_BASE_URL}/reports/leads/`;

// Role Constants
const USER_ROLE = localStorage.getItem("role");
const isAdmin = USER_ROLE === "ADMIN";
const isSupervisor = USER_ROLE === "SUPERVISOR";

export default function LeadsReports() {
  const navigate = useNavigate();
  // Date Filters
  const [type, setType] = useState("daily");
  const [date, setDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromWeek, setFromWeek] = useState("");
  const [toWeek, setToWeek] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");

  // New Detailed Filters
  const [ascCode, setAscCode] = useState(null);
  const [ascName, setAscName] = useState(null);
  const [ascLocation, setAscLocation] = useState(null);
  const [services, setServices] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [supervisor, setSupervisor] = useState(null);
  const [agent, setAgent] = useState(null);
  const [disposition, setDisposition] = useState(null);
  const [prospect, setProspect] = useState(null);
  const [sale, setSale] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock Options (Shared with Dashboard normally, should be in a context or constant file)
  const optionsASCCode = [
    { value: "ASC001", label: "ASC001" },
    { value: "ASC002", label: "ASC002" },
  ];
  const optionsASCName = [
    { value: "TechFix", label: "TechFix Solutions" },
    { value: "AlphaService", label: "Alpha Service Center" },
  ];
  const optionsLocation = [
    { value: "NY", label: "New York" },
    { value: "CA", label: "California" },
  ];
  const optionsServices = [
    { value: "repair", label: "Repair" },
    { value: "install", label: "Installation" },
  ];
  const optionsCampaign = [
    { value: "q1_promo", label: "Q1 Promo" },
    { value: "summer_sale", label: "Summer Sale" },
  ];

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--input-bg)",
      borderColor: state.isFocused ? "var(--primary-mid)" : "var(--border-soft)",
      borderRadius: "12px",
      minHeight: "44px",
      boxShadow: state.isFocused ? `0 0 0 3px var(--border-soft)` : "none",
      "&:hover": {
        borderColor: "var(--primary-mid)",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--card-bg)",
      borderRadius: "12px",
      marginTop: "4px",
      overflow: "hidden",
      boxShadow: "var(--shadow-medium)",
      border: "1px solid var(--border-soft)",
      zIndex: 99,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "rgba(148, 163, 184, 0.1)"
        : state.isSelected
          ? "var(--primary-mid)"
          : "transparent",
      color: state.isSelected ? "white" : "var(--text-dark)",
      "&:active": {
        backgroundColor: "var(--primary-mid)",
      },
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--btn-bg)",
      borderRadius: "8px",
      padding: "2px 6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
      fontWeight: "600",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "white",
      },
    }),
    input: (base) => ({
      ...base,
      color: "var(--text-dark)",
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--text-dark)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--text-muted-dark)",
    }),
  };

  const fetchReport = async () => {
    setLoading(true);
    let params = { type };

    if (type === "daily") params.date = date;
    if (type === "custom-date") {
      params.from_date = fromDate;
      params.to_date = toDate;
    }
    if (type === "custom-week") {
      params.from_week = fromWeek;
      params.to_week = toWeek;
    }
    if (type === "custom-month") {
      params.from_month = fromMonth;
      params.to_month = toMonth;
    }

    // Add new filters to params if backend supports them
    if (ascCode) params.asc_code = ascCode.map(o => o.value).join(",");
    if (ascName) params.asc_name = ascName.map(o => o.value).join(",");

    try {
      // Use mock data if API fails or for demo layout
      const res = await axios.get(API, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      setData(res.data.data || []);
    } catch (error) {
      console.error("Report fetch error", error);
      // Fallback mock data for visualization
      setData([
        { agent_name: "John Doe", email: "john@example.com", location: "NY", team_leader: "Sup A", total_calls: 50, connects: 30, non_connects: 20, connectivity_percent: 60, productivity_per_head: 5 },
        { agent_name: "Jane Smith", email: "jane@example.com", location: "CA", team_leader: "Sup B", total_calls: 45, connects: 25, non_connects: 20, connectivity_percent: 55, productivity_per_head: 4.5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-wrapper">
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <h2 className="reports-title">Lead Performance Analytics (Data View)</h2>
      </div>

      <div className="reports-controls-container">
        {/* Date Filters Row */}
        <div className="reports-controls-row">
          <div className="control-group">
            <label>Report Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="legacy-input">
              <option value="daily">Daily Report</option>
              <option value="custom-date">Date Range</option>
              <option value="custom-week">Weekly Range</option>
              <option value="custom-month">Monthly Range</option>
            </select>
          </div>

          {type === "daily" && (
            <div className="control-group">
              <label>Select Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="legacy-input" />
            </div>
          )}

          {type === "custom-date" && (
            <>
              <div className="control-group">
                <label>From Date</label>
                <input type="date" onChange={e => setFromDate(e.target.value)} className="legacy-input" />
              </div>
              <div className="control-group">
                <label>To Date</label>
                <input type="date" onChange={e => setToDate(e.target.value)} className="legacy-input" />
              </div>
            </>
          )}
          {/* ... (Keep other date logic simplified for brevity if needed, or expand) ... */}
        </div>

        {/* Detailed Filters Grid */}
        <div className="filters-grid-report">
          <div className="filter-item">
            <label>ASC Code</label>
            <Select
              options={optionsASCCode}
              isMulti
              styles={customStyles}
              value={ascCode}
              onChange={setAscCode}
              isDisabled={!isAdmin}
            />
          </div>
          <div className="filter-item">
            <label>ASC Name</label>
            <Select
              options={optionsASCName}
              isMulti
              styles={customStyles}
              value={ascName}
              onChange={setAscName}
              isDisabled={!isAdmin}
            />
          </div>
          <div className="filter-item">
            <label>ASC Location</label>
            <Select
              options={optionsLocation}
              isMulti
              styles={customStyles}
              value={ascLocation}
              onChange={setAscLocation}
              isDisabled={!isAdmin}
            />
          </div>
          <div className="filter-item">
            <label>Services</label>
            <Select
              options={optionsServices}
              styles={customStyles}
              value={services}
              onChange={setServices}
            />
          </div>
          <div className="filter-item">
            <label>Campaign</label>
            <Select
              options={optionsCampaign}
              styles={customStyles}
              value={campaign}
              onChange={setCampaign}
            />
          </div>
          <div className="filter-item">
            <label>Supervisor</label>
            <Select placeholder="Select Supervisor" isMulti styles={customStyles} value={supervisor} onChange={setSupervisor} isDisabled={!isAdmin && !isSupervisor} />
          </div>
          <div className="filter-item">
            <label>Agent</label>
            <Select placeholder="Select Agent" isMulti styles={customStyles} value={agent} onChange={setAgent} />
          </div>
        </div>

        <div className="action-row">
          <button className="apply-report-btn" onClick={fetchReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Team Leader</th>
              <th>Total Calls</th>
              <th>Connects</th>
              <th>Non-Connects</th>
              <th>Conn. %</th>
              <th>Productivity</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((r, i) => (
                <tr key={i}>
                  <td data-label="Agent">{r.agent_name}</td>
                  <td data-label="Email">{r.email}</td>
                  <td data-label="Branch">{r.location}</td>
                  <td data-label="Team Leader">{r.team_leader || "N/A"}</td>
                  <td data-label="Total Calls">{r.total_calls}</td>
                  <td data-label="Connects">{r.connects}</td>
                  <td data-label="Non-Connects">{r.non_connects}</td>
                  <td data-label="Conn. %">{r.connectivity_percent}%</td>
                  <td data-label="Productivity">{r.productivity_per_head}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px", opacity: 0.5 }}>
                  No data available for the selected period (Click Generate to load demo data)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
