import { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import Select from "react-select";
import "../styles/UserManagement.css";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { FiX, FiMenu , FiUserPlus} from "react-icons/fi";
import { FaSearch} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config.jsx";

const API_URL = `${API_BASE_URL}/configurations/users/`;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  // Filters
  const [emailFilter, setEmailFilter] = useState("");
  const [ascNameFilter, setAscNameFilter] = useState([]);
  const [ascCodeFilter, setAscCodeFilter] = useState([]);
  const [ascLocationFilter, setAscLocationFilter] = useState([]);
  const [roleFilter, setRoleFilter] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Options for multi-selects
  const [ascNames, setAscNames] = useState([]);
  const [ascCodes, setAscCodes] = useState([]);
  const [ascLocations, setAscLocations] = useState([]);
  const LOGGED_IN_ROLE = (localStorage.getItem("role") || "").toUpperCase();

  const ROLE_OPTIONS = [
    { value: "ADMIN", label: "Admin" },
    { value: "SUPERVISOR", label: "Supervisor" },
    { value: "AGENT", label: "Agent" },
  ].filter(opt => {
    if (LOGGED_IN_ROLE === "ADMIN" && opt.value === "ADMIN") return false;
    return true;
  });

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--input-bg)",
      borderColor: state.isFocused ? "var(--primary-mid)" : "var(--border-soft)",
      borderRadius: "8px",
      minHeight: "38px",
      minWidth: "160px",
      boxShadow: state.isFocused ? `0 0 0 2px var(--border-soft)` : "none",
      "&:hover": {
        borderColor: "var(--primary-mid)",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--card-bg)",
      borderRadius: "8px",
      boxShadow: "var(--shadow-medium)",
      border: "1px solid var(--border-soft)",
      zIndex: 100,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "rgba(148, 163, 184, 0.1)"
        : state.isSelected
          ? "var(--primary-mid)"
          : "transparent",
      color: state.isSelected ? "white" : "var(--text-dark)",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--btn-bg)",
      borderRadius: "6px",
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
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--text-muted-dark)",
      fontSize: "0.9rem",
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--text-dark)",
    }),
    input: (base) => ({
      ...base,
      color: "var(--text-dark)",
    }),
  };

  // Auto-fetch users whenever filters change
  useEffect(() => {
    fetchUsers();
  }, [
    emailFilter,
    ascNameFilter,
    ascCodeFilter,
    ascLocationFilter,
    roleFilter,
    startDate,
    endDate,
  ]);

  // Fetch filter options separately once on mount to prevent disappearing options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/configurations/asc-filters/`, {
        params: {
          logged_in_role: LOGGED_IN_ROLE
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (res.data?.status === "success") {
        const { asc_names, asc_codes, asc_locations } = res.data.data;
        setAscNames((asc_names || []).map((v) => ({ value: v, label: v })));
        setAscCodes((asc_codes || []).map((v) => ({ value: v, label: v })));
        setAscLocations((asc_locations || []).map((v) => ({ value: v, label: v })));
      }
    } catch (error) {
      console.error("Failed to fetch filter options", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
        logged_in_role: LOGGED_IN_ROLE
      };

      if (emailFilter) params.email = emailFilter;
      if (ascNameFilter.length) params.asc_name = ascNameFilter.map((i) => i.value);
      if (ascCodeFilter.length) params.asc_code = ascCodeFilter.map((i) => i.value);
      if (ascLocationFilter.length) params.asc_location = ascLocationFilter.map((i) => i.value);
      if (roleFilter.length) params.role = roleFilter.map((i) => i.value);
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const queryString = qs.stringify(params, { arrayFormat: "repeat" });

      const res = await axios.get(`${API_URL}?${queryString}`);
      const data = res.data?.results || res.data?.data || [];

      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setEmailFilter("");
    setAscNameFilter([]);
    setAscCodeFilter([]);
    setAscLocationFilter([]);
    setRoleFilter([]);
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="dashboard">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar />
      </aside>

      <main className="main-panel">
        
        <Navbar pageTitle="User Management" subTitle="Manage your system users" />
        <div style={{ marginBottom: '20px', padding: '0 30px' }}>
           <div className="search-container"> 
            <div className="search-bar"> <FaSearch /><input
            type="text"
            placeholder="Search Email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          /></div>
             <button className="add-user" onClick={() => navigate('/adduser')}>Create <FiUserPlus /> </button>
         </div>
        </div>

        {/* FILTERS */}

        <div className="filters">
         

          <Select
            isMulti
            placeholder="ASC Name"
            options={ascNames}
            value={ascNameFilter}
            onChange={setAscNameFilter}
            closeMenuOnSelect={false}
            styles={selectStyles}
          />

          <Select
            isMulti
            placeholder="ASC Code"
            options={ascCodes}
            value={ascCodeFilter}
            onChange={setAscCodeFilter}
            closeMenuOnSelect={false}
            styles={selectStyles}
          />

          <Select
            isMulti
            placeholder="ASC Location"
            options={ascLocations}
            value={ascLocationFilter}
            onChange={setAscLocationFilter}
            closeMenuOnSelect={false}
            styles={selectStyles}
          />

          <Select
            isMulti
            placeholder="Role"
            options={ROLE_OPTIONS}
            value={roleFilter}
            onChange={setRoleFilter}
            closeMenuOnSelect={false}
            styles={selectStyles}
          />

          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Clear Filters */}
          <button className="clear-filters" onClick={clearFilters} title="Clear Filters">
            <FiX size={20} />
          </button>
        </div>

        {/* TABLE */}
        <table className="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email & Contact</th>
              <th>Name</th>
              <th>ASC Details</th>
              <th>Role</th>

              {/* <th>Actions</th> */}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td data-label="User ID">#{user.id}</td>
                  <td data-label="Email & Contact">
                    <div>{user.email}</div>
                    <div className="muted">{user.phone_no}</div>
                  </td>
                  <td data-label="Name">{user.asc_name}</td>
                  <td data-label="ASC Details">
                    {user.asc_code} • {user.asc_location}
                  </td>
                  <td data-label="Role">{user.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <footer className="pagination">
          Showing {users.length} users
        </footer>
      </main>
    </div>
  );
}
