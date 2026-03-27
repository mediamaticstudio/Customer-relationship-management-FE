import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { FiArrowLeft, FiMenu, FiX, FiPrinter, FiDownload, FiLogOut } from "react-icons/fi";
import { API_BASE_URL } from "../config.jsx";
import { toast } from "react-toastify";
import "../styles/Reports.css";

export default function ASCPerformance() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get("code");
    const location = searchParams.get("location");

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        if (code && location) {
            fetchAgentPerformance();
        }
    }, [code, location]);

    const fetchAgentPerformance = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/agent-performance/`, {
                params: {
                    asc_code: code,
                    location: location
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
            });
            // The API returns agents in data.results (paginated) or data.agents (original format)
            const data = response.data;
            setAgents(data.results || data.agents || []);
        } catch (error) {
            console.error("Failed to fetch agent performance", error);
            toast.error("Failed to load agent performance data");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        const queryParams = {
            type: "agent-performance",
            asc_code: code,
            location: location
        };
        
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/print/`, {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'text/html;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Print failed", error);
            toast.error("Failed to prepare print view.");
        }
    };

    const handleExport = async () => {
        const queryParams = {
            type: "agent-performance",
            asc_code: code,
            location: location,
            report_format: "csv"
        };
        
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/export/`, {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `agent_performance_${code}_${new Date().toISOString().split('T')[0]}.csv`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success("Export successful");
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Export failed. Please try again.");
        }
    };

    const isAscView = localStorage.getItem("is_asc_view") === "true";

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout/`, {}, {
                headers: {
                    "X-DB-Name": localStorage.getItem("selected_db") || "default",
                },
            });
            const theme = localStorage.getItem("theme");
            localStorage.clear();
            if (theme) localStorage.setItem("theme", theme);
            navigate("/asc-login"); 
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout failed", error);
            localStorage.clear();
            navigate("/asc-login");
        }
    };

    return (
        <div className={`reports-tabbed ${isAscView ? 'asc-only-view' : ''}`}>
            {!isAscView && (
                <>
                    <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>

                    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                        <Sidebar />
                    </aside>
                </>
            )}

            <main className="reports-main" style={isAscView ? { padding: "40px", maxWidth: "1200px", margin: "0 auto" } : {}}>
                <header className="panel-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        {!isAscView && (
                            <button className="action-btn" onClick={() => navigate(-1)} style={{ background: "var(--card-bg)", border: "1px solid var(--border-soft)", borderRadius: "8px", padding: "8px" }}>
                                <FiArrowLeft size={18} />
                            </button>
                        )}
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary-dark)" }}>
                            ASC Performance: {code} ({location})
                        </h1>
                    </div>

                    <div className="report-actions">
                        <button className="print-btn" onClick={handlePrint}>
                            <FiPrinter /> Print
                        </button>
                        <button className="export-btn" onClick={handleExport}>
                            <FiDownload /> Export
                        </button>
                        {isAscView && (
                            <button className="export-btn" onClick={handleLogout} style={{ background: "var(--error-red)", marginLeft: "10px" }}>
                                <FiLogOut /> Logout
                            </button>
                        )}
                    </div>
                </header>

                <section className="tab-content" style={{ padding: "0" }}>
                    {loading ? (
                        <div className="loading-state">Loading agent data...</div>
                    ) : agents.length === 0 ? (
                        <div className="no-data">No agents found for this Service Center</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Agent Name</th>
                                        <th>Assigned</th>
                                        <th>Followup</th>
                                        <th>Sale Won</th>
                                        <th>Deal Lost</th>
                                        <th>Conversion Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agents.map((agent, idx) => (
                                        <tr key={idx}>
                                            <td>{agent.agent_name}</td>
                                            <td>{agent.assigned}</td>
                                            <td>{agent.followup}</td>
                                            <td className="success">{agent.deal_won}</td>
                                            <td className="error">{agent.deal_lost}</td>
                                            <td>
                                                <span className="conversion-rate">{agent.conversion_rate}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
