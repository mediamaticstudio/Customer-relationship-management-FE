import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiSearch, FiChevronRight as FiArrow } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";
import "../styles/Assigned.css";

const API = `${API_BASE_URL}/crm/leads/`;

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
};

// Pastel background colors paired with a contrasting text color
const AVATAR_PALETTES = [
  { bg: "#f5e0de", text: "#7a2a28" }, // soft rose / MB
  { bg: "#d6eae0", text: "#1a5c3a" }, // soft mint / CR
  { bg: "#f0e8d0", text: "#7a5c10" }, // soft golden / GZ
  { bg: "#dde6f5", text: "#1a408e" }, // soft blue
  { bg: "#e8d8f5", text: "#5a1a8e" }, // soft lavender
  { bg: "#f5e6d8", text: "#8e4a1a" }, // soft peach
  { bg: "#d8f0f5", text: "#1a6b7a" }, // soft cyan
  { bg: "#f5f0d0", text: "#7a7010" }, // soft lime
  { bg: "#f0d8e8", text: "#8e1a5a" }, // soft pink
  { bg: "#d8e8d8", text: "#2a6b2a" }, // soft green
];

const getAvatarPalette = (name) => {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

export const ClientPortal = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/configurations/packages/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      if (res.data?.status === "success") setPackages(res.data.data);
    } catch (e) {
      console.error("Failed to load packages", e);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}`, {
        params: {
          phone_status: '"status": "converted"',
          page,
          page_size: pageSize,
          global: "true",
          search: search || undefined,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      const rawLeads = res.data?.data || [];
      const portalLeads = rawLeads.filter(lead =>
        lead.other_lead_info?.selected_packages?.length > 0
      );
      setLeads(portalLeads);
      setTotalCount(res.data?.count || 0);
    } catch (error) {
      if (error.response?.status === 401) { localStorage.clear(); navigate("/login"); }
      else toast.error("Failed to load portal leads");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, navigate, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const mapPackageNames = (selectedIds) => {
    if (!selectedIds || !packages.length) return [];
    return selectedIds.map(id => {
      // Normalize ID by removing prefixes (pkg_ or sub_)
      let targetId = id;
      if (typeof id === "string") {
        if (id.startsWith("pkg_")) {
          targetId = parseInt(id.replace("pkg_", ""), 10);
        } else if (id.startsWith("sub_")) {
          targetId = parseInt(id.replace("sub_", ""), 10);
        } else if (!isNaN(id)) {
          targetId = parseInt(id, 10);
        }
      }

      const pkg = packages.find(p => p.id === targetId) || 
                  packages.flatMap(p => p.sub_packages || []).find(sub => sub.id === targetId);
      return pkg ? (pkg.package_name || pkg.sub_package_name) : `Pkg #${id}`;
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section className="assigned-leads">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar selectedStatus="" />
      </aside>

      <main className="main" style={{ background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar
          pageTitle={`Welcome, ${localStorage.getItem("userName") || "User"}`}
          subTitle="Client Portal"
        />

        <div className="content" style={{ padding: "24px 32px", flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Title Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "#1a1a1a" }}>Client Portal</h1>
              <p style={{ margin: "3px 0 0", color: "#888", fontSize: "0.85rem" }}>Waiting Sale Won Leads & Package Requirements</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Search Bar */}
              <div style={{
                display: "flex", alignItems: "center",
                background: "#fff", border: "1px solid #e0d8cc",
                borderRadius: "8px", padding: "0 12px",
                height: "38px", gap: "8px"
              }}>
                <FiSearch size={14} color="#bbb" />
                <input
                  type="text"
                  placeholder="Search leads, companies or packages..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: "0.82rem", color: "#333", width: "220px"
                  }}
                />
              </div>
              {/* New Lead Button */}
              <button
                onClick={() => navigate("/create")}
                style={{
                  background: "#6C3A39", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "9px 18px",
                  fontSize: "0.85rem", fontWeight: "600", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "5px",
                  height: "38px", whiteSpace: "nowrap"
                }}
              >
                + New Lead
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e8e0d0",
            overflow: "hidden",
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
                <p>Loading portal data...</p>
              </div>
            ) : leads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
                <p>No waiting sale won leads found.</p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0e8d8" }}>
                    {["LEAD NAME", "COMPANY NAME", "SELECTED PACKAGES", "STATUS BADGE", "REQUIREMENT FORM"].map((col) => (
                      <th key={col} style={{
                        padding: "14px 16px",
                        textAlign: "left",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        color: "#aaa",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: "#fff"
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => {
                    const pkgNames = mapPackageNames(lead.other_lead_info?.selected_packages);
                    const initials = getInitials(lead.lead_name);
                    const palette = getAvatarPalette(lead.lead_name);
                    return (
                      <tr key={lead.id} style={{
                        borderBottom: idx < leads.length - 1 ? "1px solid #f5f0e8" : "none",
                        transition: "background 0.15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafaf7"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Lead Name */}
                        <td style={{ padding: "18px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              width: "38px", height: "38px", borderRadius: "50%",
                              background: palette.bg,
                              color: palette.text,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.72rem", fontWeight: "800", flexShrink: 0,
                              border: `1.5px solid ${palette.bg}`,
                              letterSpacing: "0.03em"
                            }}>
                              {initials.toUpperCase()}
                            </div>
                            <span
                              onClick={() => navigate(`/leads/${lead.id}`)}
                              style={{ fontWeight: "600", color: "#1a1a1a", cursor: "pointer", fontSize: "0.9rem", lineHeight: "1.3" }}
                            >
                              {lead.lead_name}
                            </span>
                          </div>
                        </td>

                        {/* Company */}
                        <td style={{ padding: "18px 16px", color: "#555", fontSize: "0.875rem" }}>
                          {lead.lead_company || "-"}
                        </td>

                        {/* Packages */}
                        <td style={{ padding: "18px 16px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {pkgNames.length > 0 ? pkgNames.map((name, i) => (
                              <span key={i} style={{
                                background: "#f5ece8",
                                color: "#6C3A39",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                border: "1px solid #e8d8d0"
                              }}>
                                {name}
                              </span>
                            )) : (
                              <span style={{ color: "#aaa", fontSize: "0.8rem" }}>None</span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: "18px 16px" }}>
                          <span style={{
                            background: "#1d6348",
                            color: "#fff",
                            padding: "5px 16px",
                            borderRadius: "30px",
                            fontSize: "0.68rem",
                            fontWeight: "700",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            display: "inline-block"
                          }}>
                            WAITING
                          </span>
                        </td>

                        {/* Requirement Form */}
                        <td style={{ padding: "18px 16px" }}>
                          <button
                            onClick={() => toast.info(`Requirement form for ${lead.lead_name}`)}
                            style={{
                              background: "transparent",
                              border: "1.5px solid #6C3A39",
                              color: "#6C3A39",
                              padding: "6px 16px",
                              borderRadius: "8px",
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#6C3A39"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6C3A39"; }}
                          >
                            Requirements <FiArrow size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}

            {/* Pagination Row - always at bottom of card */}
            <div style={{ marginTop: "auto" }}>
            {!loading && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderTop: "1px solid #ede5d8",
                background: "#fdf8f0",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}>
                <span style={{ color: "#999", fontSize: "0.83rem" }}>
                  Showing {leads.length} of {totalCount} leads
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{
                      width: "30px", height: "30px",
                      borderRadius: "6px",
                      border: "1px solid #d8cfc4",
                      background: page === 1 ? "#f5f0e8" : "#fff",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      opacity: page === 1 ? 0.45 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#555",
                      transition: "all 0.15s"
                    }}
                  >
                    <FiChevronLeft size={15} />
                  </button>
                  <button
                    disabled={page >= totalPages || totalPages === 0}
                    onClick={() => setPage(p => p + 1)}
                    style={{
                      width: "30px", height: "30px",
                      borderRadius: "6px",
                      border: "1px solid #d8cfc4",
                      background: (page >= totalPages || totalPages === 0) ? "#f5f0e8" : "#fff",
                      cursor: (page >= totalPages || totalPages === 0) ? "not-allowed" : "pointer",
                      opacity: (page >= totalPages || totalPages === 0) ? 0.45 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#555",
                      transition: "all 0.15s"
                    }}
                  >
                    <FiChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
            </div>{/* end marginTop:auto pagination wrapper */}
          </div>{/* end table card */}

        </div>
      </main>
    </section>
  );
};
