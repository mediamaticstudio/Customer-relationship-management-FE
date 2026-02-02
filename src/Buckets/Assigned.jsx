import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import "../styles/Assigned.css";
import axios from "axios";
import { FiMenu, FiX, FiRotateCcw } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AgentList } from "./AgentList";
import { toast } from "react-toastify";
import UserDashBoard from "../components/UserDashBoard";
import { API_BASE_URL } from "../config.jsx";

const API = `${API_BASE_URL}/crm/leads/`;
const API_URL = `${API_BASE_URL}/crm/get/lead/`; // change if needed


export const Assigned = () => {
  const user_role = localStorage.getItem("role");
  console.log(user_role)
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ================= STATUS FROM URL ================= */
  const statusFromUrl = searchParams.get("status") || "assigned";
  const [selectedStatus, setSelectedStatus] = useState(statusFromUrl);

  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); //  USER CONTROLLED
  const [totalCount, setTotalCount] = useState(0);

  const [selectedLeads, setSelectedLeads] = useState([]); //  MULTI SELECT
  const [agents, setAgents] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [today, setToday] = useState(false)

  const [filters, setFilters] = useState({
    name: "",
    company: "",
    region: "",
  });

  /* ================= SYNC URL → STATE ================= */
  useEffect(() => {
    setSelectedStatus(statusFromUrl);
    setPage(1);
    setSelectedLeads([]);
  }, [statusFromUrl]);

  /* ================= SYNC STATE → URL ================= */
  useEffect(() => {
    setSearchParams({ status: selectedStatus });
  }, [selectedStatus, setSearchParams]);

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
          name: filters.name,
          company: filters.company,
          region: filters.region,
          today,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setLeads(res.data?.data || []);
      setTotalCount(res.data?.count || 0);
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
    filters.name,
    filters.company,
    filters.region,
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
        `${API_BASE_URL}/api/auth/userlist/`,
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
    setFilters({ name: "", company: "", region: "" });
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
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (res.data.already_assigned) {
        toast.warning(res.data.message || "You already have a lead");
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
        <div className="content">
          {user_role === "AGENT" && selectedStatus === "assigned" && <div className="assigned-dashboard-center"> <UserDashBoard setToday={setToday} />
          </div>}
          {user_role == "AGENT" && <div className="lead-btn"><button
            className="back-btn" onClick={() => {
              assignLead()
              navigate("/assigned?status=assigned")
            }}
            disabled={loading}
          >
            Get Lead
          </button>
          <button
            className="back-btn" onClick={() => {
             
              navigate("/create")
            }}
            disabled={loading}
          >
            Add Lead
          </button> </div>
          }
          {/* Header */}
          {user_role != "AGENT" && <div className="table-header"> <div className="search-bar"> <input type="text" placeholder="Search by name, company or region..." className="search-input" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /> <button className="clear-button" onClick={() => setSearch("")}> <FiX size={18} /> </button> </div> <div className="filter"> <button onClick={() => setShowFilter(true)} className="search-filter" > Filter </button> <button onClick={handleReset} className="reset-button"> <FiRotateCcw size={18} /> </button> </div> </div>}

          {/* Table */}
          <table className="leads">
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
                <th>Region</th>
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
                    <td onClick={() => navigate(`/leads/${lead.id}`)} data-label="Name">
                      {lead.lead_name}
                    </td>
                    <td data-label="Company">{lead.lead_company || "-"}</td>
                    <td data-label="Region">{lead.lead_region || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          


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
        </div>
      </main>
      {/* Filter Modal */}
      {showFilter && (<>
        <div className="filter-overlay" onClick={() => setShowFilter(false)} />
        <div className="filter-panel">
          <h3>Filter Leads</h3>
          {["name", "company", "region"].map((key) => (
            <div className="filter-group" key={key}>
              <label>{key}</label>
              <input type="text" value={filters[key]} onChange={(e) => setFilters(
                { ...filters, [key]: e.target.value })} />
            </div>))} <div className="filter-actions">
            <button className="clear-btn" onClick={() => setFilters(
              { name: "", company: "", region: "" })} > Clear </button>
            <button className="apply-btn" onClick={() => { setShowFilter(false); setPage(1); }} > Apply </button> </div> </div> </>)}
    </section>
  );
};
