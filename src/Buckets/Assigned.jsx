import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import "../styles/Assigned.css";
import axios from "axios";
import { FiMenu, FiX, FiRotateCcw, FiDownloadCloud, FiUserPlus, FiSearch } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AgentList } from "./AgentList";
import { toast } from "react-toastify";
import UserDashBoard from "../components/UserDashBoard";
import { API_BASE_URL } from "../config.jsx";

const API = `${API_BASE_URL}/crm/leads/`;
const API_URL = `${API_BASE_URL}/crm/get/lead/`; // change if needed

const BUCKET_NAMES = {
  "assigned": "Assigned",
  "second-attempt": "Second Attempt",
  "third-attempt": "Third Attempt",
  "followup": "Follow Up",
  "prospect": "Prospect",
  "completed": "Completed",
  "re-research": "Re-Research",
  "deal-won": "Sale Won",
  "sale-won": "Sale Won",
  "sale-lost": "Sale Lost",
  "invalid": "Invalid",
  "dnd": "DND",
  "unassigned": "Unassigned"
};

const STATUS_OPTIONS = [
  { value: "email-request", label: "Email Request" },
  { value: "not-interested", label: "Not Interested" },
  { value: "callback", label: "Call Back" },
  { value: "interested", label: "Interested" },
  { value: "language-barrier", label: "Language Barrier" },
  { value: "hung-up", label: "Hung Up" },
  { value: "followup", label: "Follow Up" },
  { value: "Callback-Voicemail", label: "Callback - Voicemail" },
  { value: "wrong-number", label: "Wrong Number" },
  { value: "converted", label: "Sale Won" },
  { value: "fax-tone", label: "Fax Tone" },
  { value: "direct-voicemail", label: "Direct Voice mail" },
  { value: "general-voicemail", label: "General Voicemail" },
  { value: "not-in-service", label: "Not In Service" },
  { value: "disconnected", label: "Disconnected Number" },
  { value: "receptionist", label: "Receptionist / Operator" },
  { value: "unanswered", label: "Unanswered" },
  { value: "call-failed", label: "Call Cannot Be Completed" },
  { value: "spam-blocked", label: "Call Blocked as Spam" },
  { value: "not-accepting", label: "Not Accepting Call" },
  { value: "dnd", label: "Do Not Call (DND)" },
  { value: "duplicate", label: "Duplicate" },
  { value: "invalid", label: "Invalid Number" },
];



export const Assigned = () => {
  const user_role = localStorage.getItem("role");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState("General");

  /* ================= STATUS FROM URL ================= */
  const statusFromUrl = searchParams.get("status") || "assigned";
  const searchFromUrl = searchParams.get("search") || "";
  const isGlobalFromUrl = searchParams.get("global") === "true";
  const [selectedStatus, setSelectedStatus] = useState(statusFromUrl);

  /* ================= STATE ================= */
  const [search, setSearch] = useState(searchFromUrl);
  const [isGlobal, setIsGlobal] = useState(isGlobalFromUrl);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [pageSize, setPageSize] = useState(10); //  USER CONTROLLED
  const [totalCount, setTotalCount] = useState(0);

  const [selectedLeads, setSelectedLeads] = useState([]); //  MULTI SELECT
  const [agents, setAgents] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [today, setToday] = useState(false)

  const [filters, setFilters] = useState({
    name: "",
    company: "",
    designation: "",
    phone_status: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ================= SYNC URL → STATE ================= */
  useEffect(() => {
    setSelectedStatus(statusFromUrl);
    setSearch(searchFromUrl);
    setIsGlobal(isGlobalFromUrl);
    setPage(Number(searchParams.get("page") || 1));
    setSelectedLeads([]);
  }, [statusFromUrl, searchFromUrl, isGlobalFromUrl, searchParams]);

  /* ================= SYNC STATE → URL ================= */
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedStatus) params.set("status", selectedStatus);
    if (search) {
      params.set("search", search);
      if (isGlobal) params.set("global", "true");
    }
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params);
  }, [selectedStatus, search, isGlobal, page, setSearchParams]);


  /* ================= FETCH LEADS ================= */

  // useEffect(() => {
  //   let ignore = false;

  //   const fetchLeads = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await axios.get( `${API}`, {
  //         params: {
  //           status: selectedStatus,
  //           page,
  //           page_size: pageSize,
  //           search,
  //           name: filters.name,
  //           company: filters.company,
  //           region: filters.region,
  //           today
  //         },
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("access")}`,
  //         },
  //       });

  //       if (!ignore) {
  //         setLeads(res.data?.data || []);
  //         setTotalCount(res.data?.count || 0);
  //       }
  //     } catch (error) {
  //       if (error.response?.status === 401) {
  //         localStorage.clear();
  //         navigate("/login");
  //       } else {
  //         // Show any other backend error in toast
  //         const backendMessage =
  //           error.response?.data?.message ||
  //           error.response?.data?.error ||
  //           error.message ||
  //           "Something went wrong";
  //         toast.error(backendMessage);
  //       }
  //     } finally {
  //       if (!ignore) setLoading(false);
  //     }
  //   };

  //   fetchLeads();
  //   return () => (ignore = true);
  // }, [
  //           selectedStatus,
  //           page,
  //           today,
  //           pageSize,
  //           search,
  //           filters.name,
  //           filters.company,
  //           filters.region,
  //           navigate,
  //         ]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}`, {
        params: {
          status: selectedStatus,
          page,
          page_size: pageSize,
          search,
          global: isGlobal ? "true" : "false",
          name: filters.name,
          company: filters.company,
          designation: filters.designation,
          phone_status: filters.phone_status,
          today,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setLeads(res.data?.data || []);
      setTotalCount(res.data?.count || 0);

      // --- AUTO-SWITCH BUCKET IF GLOBAL SEARCH FINDS SOMETHING ELSE ---
      if (isGlobal && res.data?.data?.length > 0) {
        const firstLeadStatus = res.data.data[0].status;
        if (firstLeadStatus && firstLeadStatus !== selectedStatus) {
          setSelectedStatus(firstLeadStatus);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Something went wrong";
        toast.error(backendMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [
    selectedStatus,
    page,
    pageSize,
    search,
    isGlobal,
    filters.name,
    filters.company,
    filters.designation,
    filters.phone_status,
    today,
    navigate,
  ]);


  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /* ================= FETCH AGENTS ================= */
  useEffect(() => {
    const fetchAgents = async () => {
      const res = await axios.get(
        `${API_BASE_URL}/auth/userlist/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setAgents(res.data.data || []);
    };

    fetchAgents();
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize);

  /* ================= RESET ================= */
  const handleReset = () => {
    setSearch("");
    setIsGlobal(false);
    setFilters({ name: "", company: "", designation: "", phone_status: "" });
    setPage(1);
  };

  /* ================= CHECKBOX HANDLERS ================= */
  const toggleLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  /* ================= BULK ASSIGN ================= */
  const handleBulkAssign = async (agentId) => {
    if (!agentId || selectedLeads.length === 0) return;

    setAssigning(true);
    try {
      const res = await axios.post(
        API,
        {
          lead_ids: selectedLeads, //  BULK
          agent_id: agentId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setLeads((prev) =>
        prev.filter((lead) => !selectedLeads.includes(lead.id))
      );
      setSelectedLeads([]);
      setPage(1);

      //  navigate("/assigned?status=unassigned", { replace: true });
      if (res.ok) {
        toast.warning(res.data.message || "Lead assigned successfully");
      } else {
        setPage(1);
        toast.success(res.data.message || "Error");
      }

    } catch (err) {
      console.error("Bulk assign failed", err);
    } finally {
      setAssigning(false);
    }
  };
  const assignLead = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        API_URL,
        { language: selectedLanguage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (res.data.already_assigned) {
        toast.warning(res.data.message || "You already have a lead");
      } else if (res.data.status === "Fail") {
        toast.warning(res.data.message || "Limit reached");
      } else {
        setPage(1);
        toast.success(res.data.message || "Lead assigned successfully");
      }
      fetchLeads();
    } catch (error) {
      toast.error("Unable to assign lead", error);
    } finally {
      setLoading(false);
    }
  };


  /* ================= UI ================= */
  return (
    <section className="assigned-leads">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar
          totalCount={totalCount}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </aside>

      <main className="main">
        <Navbar pageTitle={`Welcome, ${localStorage.getItem("userName") || "User"}`} subTitle={`Managing Your ${BUCKET_NAMES[selectedStatus] || "Assigned"} Leads`} />
        <div className="content">
          {user_role === "AGENT" && selectedStatus === "assigned" && (
            <div className="assigned-dashboard-center" style={{ padding: "0 32px" }}>
              <UserDashBoard 
                setToday={setToday} 
                actionButtons={
                  <>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      style={{
                        background: "#fdf8f0", color: "#4A151E", border: "1.5px solid #4A151E", 
                        borderRadius: "8px", padding: "0 14px", height: "42px", fontSize: "0.85rem", fontWeight: "600",
                        outline: "none", cursor: "pointer"
                      }}
                    >
                      <option value="General">General</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                    </select>
                    <button
                      className="back-btn" onClick={() => {
                        assignLead()
                        navigate("/assigned?status=assigned")
                      }}
                      disabled={loading}
                      style={{
                        background: "#fdf8f0", color: "#4A151E", border: "1.5px solid #4A151E", 
                        borderRadius: "8px", padding: "0 20px", height: "42px", display: "flex", alignItems: "center", gap: "8px",
                        fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f4ebd8"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fdf8f0"; }}
                    >
                      <FiDownloadCloud size={16} /> Get Lead
                    </button>
                    <button
                      className="back-btn" onClick={() => { navigate("/create") }}
                      disabled={loading}
                      style={{
                        background: "#4A151E", color: "#fff", border: "none", 
                        borderRadius: "8px", padding: "0 20px", height: "42px", display: "flex", alignItems: "center", gap: "8px",
                        fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#651d28"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#4A151E"; }}
                    >
                      <FiUserPlus size={16} /> Add Lead
                    </button>
                  </>
                }
              />
            </div>
          )}
          
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #efe8d8", margin: "0 32px 32px 32px", display: "flex", flexDirection: "column", minHeight: "50vh", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", overflow: "hidden" }}>
          {/* Header */}
          {user_role !== "AGENT" ? (
            <div className="table-header" style={{ padding: "32px 32px 12px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #f5f0e8" }}>
              <div style={{
                display: "flex", alignItems: "center",
                background: "#fcfbfa", border: "1px solid #e8e3dc",
                borderRadius: "8px", padding: "0 16px",
                height: "44px", gap: "12px",
                flex: "2",
                transition: "border-color 0.2s"
              }}>
                <FiSearch size={16} color="#888" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search by name, company or designation..."
                  value={search}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearch(val);
                    setPage(1);
                    if (val) setIsGlobal(true);
                  }}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: "0.85rem", color: "#333", width: "100%", fontWeight: "500"
                  }}
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setIsGlobal(false); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#bbb", flexShrink: 0 }}
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", height: "44px" }}>
                <button 
                  onClick={() => setShowFilter(true)} 
                  style={{ 
                    background: "#4A151E", color: "#fff", border: "none", 
                    borderRadius: "8px", padding: "0 24px", fontSize: "0.85rem", fontWeight: "700",
                    cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#651d28"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#4A151E"; }}
                >
                  Filter
                </button>
                <button 
                  onClick={handleReset} 
                  style={{ 
                    background: "#fcfbfa", color: "#4A151E", border: "1px solid #e8e3dc", 
                    borderRadius: "8px", padding: "0 14px", display: "flex", alignItems: "center", 
                    cursor: "pointer", transition: "all 0.2s" 
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f4f0e8"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fcfbfa"; }}
                >
                  <FiRotateCcw size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="agent-status-filter" style={{ padding: "32px 32px 12px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #f5f0e8" }}>
              <div style={{
                display: "flex", alignItems: "center",
                background: "#fcfbfa", border: "1px solid #e8e3dc",
                borderRadius: "8px", padding: "0 16px",
                height: "44px", gap: "12px",
                flex: "2",
                transition: "border-color 0.2s"
              }}>
                <FiSearch size={16} color="#888" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search by name, company or designation..."
                  value={search}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearch(val);
                    setPage(1);
                    if (val) setIsGlobal(true);
                  }}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: "0.85rem", color: "#333", width: "100%", fontWeight: "500"
                  }}
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setIsGlobal(false); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#bbb", flexShrink: 0 }}
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              <select
                value={filters.phone_status}
                onChange={(e) => { setFilters({ ...filters, phone_status: e.target.value }); setPage(1); }}
                style={{
                  padding: "0 16px",
                  borderRadius: "8px",
                  border: "1px solid #e8e3dc",
                  background: "#fcfbfa",
                  color: "#555",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer",
                  height: "44px",
                  flex: "1",
                  appearance: "none",
                  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="%23888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                  backgroundSize: "16px",
                  transition: "border-color 0.2s"
                }}
              >
                <option value="">Filter by Phone Status</option>
                {(() => {
                  const bucketMap = {
                    "assigned": ["callback", "interested", "followup", "direct-voicemail", "general-voicemail", "email-request", "language-barrier"],
                    "second-attempt": ["unanswered", "receptionist", "hung-up", "call-failed", "spam-blocked", "not-accepting", "direct-voicemail", "general-voicemail"],
                    "third-attempt": ["unanswered", "receptionist", "hung-up", "call-failed", "spam-blocked", "not-accepting", "direct-voicemail", "general-voicemail"],
                    "followup": ["followup", "callback", "interested", "Callback-Voicemail", "email-request", "language-barrier"],
                    "prospect": ["interested"],
                    "completed": ["unanswered", "receptionist", "hung-up", "call-failed", "spam-blocked", "not-accepting", "direct-voicemail", "general-voicemail"],
                    "re-research": ["wrong-number", "not-in-service", "disconnected", "fax-tone", "invalid"],
                    "deal-won": ["converted"],
                    "sale-lost": ["not-interested"],
                    "invalid": ["invalid", "duplicate", "fax-tone"],
                    "dnd": ["dnd"]
                  };
                  const allowed = bucketMap[selectedStatus] || [];
                  const filtered = allowed.length > 0
                    ? STATUS_OPTIONS.filter(opt => allowed.includes(opt.value))
                    : STATUS_OPTIONS;

                  return filtered.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ));
                })()}
                <option value="other">Other Statuses...</option>
              </select>
              {filters.phone_status && (
                <button
                  onClick={() => { setFilters({ ...filters, phone_status: "" }); setPage(1); }}
                  style={{ background: "#eee", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Table */}
          <div style={{ flex: 1, overflowX: "auto" }}>
            <table className="leads" style={{ margin: 0, width: "100%" }}>
              <thead>
              <tr>
                {selectedStatus == "unassigned" && <th>
                  <input
                    className="select-all"
                    type="checkbox"
                    checked={
                      leads.length > 0 &&
                      selectedLeads.length === leads.length
                    }
                    onChange={toggleAll}
                  />
                </th>}
                <th>Name</th>
                <th>Company</th>
                <th>Designation</th>
                {/* <th>Bucket</th> */}
                <th>Last Updated</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="4">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="4">No data found</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    {selectedStatus == "unassigned" && <td>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleLead(lead.id)}
                      />
                    </td>}
                    <td onClick={() => navigate(`/leads/${lead.id}?${searchParams.toString()}`)} data-label="Name" style={{ cursor: "pointer" }}>
                      {lead.lead_name}
                      {lead.lead_phones && lead.lead_phones.some(p => p.status === "converted") && (
                        <span style={{
                          backgroundColor: "#f59e0b",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          marginLeft: "8px",
                          fontWeight: "bold"
                        }}>Waiting</span>
                      )}
                    </td>
                    <td data-label="Company">{lead.lead_company || "-"}</td>
                    <td data-label="Designation">{lead.lead_designation || "-"}</td>
                    {/* <td data-label="Bucket">
                      <span className={`status-badge ${lead.status}`}>
                        {BUCKET_NAMES[lead.status] || lead.status}
                      </span>
                    </td> */}
                    <td data-label="Updated">{formatDate(lead.status_updated_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* BULK CONTROLS BELOW TABLE */}
          <div className="bulk-controls">
            <div className="bulk-left">
              {selectedStatus === "unassigned" && (user_role === "ADMIN" || user_role === "SUPERADMIN") && (
                <AgentList
                  handleBulkAssign={handleBulkAssign}
                  assigning={assigning}
                  agents={agents}
                  selectedLeads={selectedLeads}
                />
              )}
            </div>

            <div className="bulk-center">
              {!loading && totalPages > 1 && (
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => setPage(1)}>First</button>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>⬅ Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ➡</button>
                  <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>Last</button>
                </div>
              )}
            </div>

            <div className="bulk-right">
              {totalCount > 10 && (
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          </div>{/* END WHITE CARD */}
        </div>
      </main>
      {/* Filter Modal */}
      {showFilter && (<>
        <div className="filter-overlay" onClick={() => setShowFilter(false)} />
        <div className="filter-panel">
          <h3>Filter Leads</h3>
          {["name", "company", "designation"].map((key) => (
            <div className="filter-group" key={key}>
              <label>{key}</label>
              <input type="text" value={filters[key]} onChange={(e) => setFilters(
                { ...filters, [key]: e.target.value })} />
            </div>))}
          <div className="filter-group">
            <label>Phone Status</label>
            <select
              value={filters.phone_status}
              onChange={(e) => setFilters({ ...filters, phone_status: e.target.value })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button className="clear-btn" onClick={() => setFilters(
              { name: "", company: "", designation: "", phone_status: "" })} > Clear </button>
            <button className="apply-btn" onClick={() => { setShowFilter(false); setPage(1); }} > Apply </button> </div> </div> </>)}
    </section>
  );
};
