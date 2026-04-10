import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { API_BASE_URL } from "../config.jsx";
import { toast } from "react-toastify";
import "../styles/Dashboard.css"; // Reuse existing styles

const ImportHistory = () => {
    const [importSummary, setImportSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchImportSummary = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/configurations/leads/import-summary/`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem("access")}` }
                });
                const data = await response.json();
                if (data.status === "success") {
                    setImportSummary(data.data);
                } else {
                    toast.error("Failed to load lead import details");
                }
            } catch (error) {
                console.error("Error fetching import summary:", error);
                toast.error("Failed to load lead import details");
            } finally {
                setLoading(false);
            }
        };

        fetchImportSummary();
    }, []);

    return (
        <div className="analytics-dashboard">
            <aside className="sidebar-container">
                <Sidebar />
            </aside>

            <main className="analytics-main">
                <Navbar />

                <div className="dashboard-header-row" style={{ padding: '0 24px', alignItems: 'center' }}>
                    <div className="dashboard-title-group" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: '#f5f5f5',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <FiArrowLeft size={20} color="#3e1018" />
                        </button>
                        <div>
                            <h1 className="dashboard-main-title">Lead Import History</h1>
                            <p style={{ color: '#a3937b', fontSize: '0.9rem', marginTop: '4px' }}>
                                Historical breakdown of lead batches
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e0cc', overflow: 'hidden' }}>
                        <table className="import-details-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Language</th>
                                    <th>Count</th>
                                    <th>Actioned</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="empty-table">Loading import history...</td>
                                    </tr>
                                ) : importSummary.length > 0 ? (
                                    importSummary.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="bold-cell">{item.date}</td>
                                            <td className="italic-cell">{item.time}</td>
                                            <td>
                                                <span className={`lang-pill lang-${item.language.toLowerCase()}`}>
                                                    {item.language}
                                                </span>
                                            </td>
                                            <td className="count-cell">{item.count}</td>
                                            <td className="count-cell" style={{ color: '#27ae60' }}>
                                                {item.actioned_count}
                                            </td>
                                            <td className="status-cell" style={{ textAlign: 'center' }}>
                                                {item.status === "green" && <FiCheckCircle className="status-icon success" />}
                                                {item.status === "orange" && <div className="status-dot warning" style={{ margin: '0 auto' }} />}
                                                {item.status === "red" && <FiXCircle className="status-icon danger" />}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-table">No import history found.</td>
                                    </tr>

                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '16px 0', color: '#a3937b', fontSize: '0.85rem' }}>
                        Showing {importSummary.length} recent batches
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImportHistory;
