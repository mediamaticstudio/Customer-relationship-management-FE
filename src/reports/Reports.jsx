import { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import {
    FiMenu, FiX, FiDownload, FiPrinter, FiLayers, FiUserCheck,
    FiRepeat, FiRefreshCcw, FiCheckCircle, FiPhoneForwarded,
    FiStar, FiAward, FiEye, FiAlertCircle, FiMinusCircle, FiPhone, FiUser, FiUserPlus, FiUserMinus
} from "react-icons/fi";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "../styles/Reports.css";
import { API_BASE_URL } from "../config.jsx";
import { toast } from "react-toastify";

export default function Reports() {
    const navigate = useNavigate();
    const user_role = localStorage.getItem("role")?.toUpperCase();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);

    // Simple Filters
    const [ascCode, setAscCode] = useState([]);
    const [ascName, setAscName] = useState([]);
    const [ascLocation, setAscLocation] = useState([]);
    const [disposition, setDisposition] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Report Data
    const [reportData, setReportData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 10;

    // Options for dropdowns
    const [ascCodeOptions, setAscCodeOptions] = useState([]);
    const [ascNameOptions, setAscNameOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [dispositionOptions, setDispositionOptions] = useState([]);

    // Tab Configuration based on user role
    const tabs = [
        { id: "overview", label: "Overview", roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR"] },
        { id: "lead-reports", label: "Lead Reports", roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR"] },
        { id: "agent-performance", label: "Agent Performance", roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR"] },
        { id: "disposition-wise", label: "Disposition Wise", roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR"] },
        { id: "asc-wise", label: "ASC Wise", roles: ["SUPERADMIN", "ADMIN"] },
        { id: "prospect-wise", label: "Prospect Wise", roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR"] },
        { id: "followup-wise", label: "Followup Wise", roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR"] },
    ];

    const visibleTabs = tabs.filter((tab) => tab.roles.includes(user_role));

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        if (activeTab) {
            fetchReportData();
        }
    }, [activeTab, ascCode, ascName, ascLocation, disposition, startDate, endDate, currentPage]);

    // Reset pagination when filters or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, ascCode, ascName, ascLocation, disposition, startDate, endDate]);

    const fetchFilterOptions = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/leads/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
            });

            const data = response.data;
            const filters = data.filters || {};
            setAscCodeOptions(filters.asc_codes || []);
            setAscNameOptions(filters.asc_names || []);
            setLocationOptions(filters.locations || []);
            setDispositionOptions(filters.status_choices || filters.dispositions || []);
        } catch (error) {
            console.error("Failed to fetch filter options", error);
        }
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Build params object - only include non-empty filters
            const params = {};

            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (ascCode?.length > 0) params.asc_code = ascCode.map(item => item.value).join(',');
            if (ascName?.length > 0) params.asc_name = ascName.map(item => item.value).join(',');
            if (ascLocation?.length > 0) params.location = ascLocation.map(item => item.value).join(',');
            if (disposition?.length > 0) params.disposition = disposition.map(item => item.value).join(',');

            // Add pagination param
            if (activeTab !== "overview") {
                params.page = currentPage;
            }

            let endpoint = `${API_BASE_URL}/crm/reports/`;
            switch (activeTab) {
                case "overview": endpoint = `${API_BASE_URL}/reports/overview/`; break;
                case "lead-reports": endpoint = `${API_BASE_URL}/reports/leads/`; break;
                case "agent-performance": endpoint = `${API_BASE_URL}/reports/agent-performance/`; break;
                case "disposition-wise": endpoint = `${API_BASE_URL}/reports/disposition-wise/`; break;
                case "asc-wise": endpoint = `${API_BASE_URL}/reports/asc-wise/`; break;
                case "prospect-wise":
                    endpoint = `${API_BASE_URL}/reports/leads/`;
                    params.status = "prospect";
                    break;
                case "followup-wise":
                    endpoint = `${API_BASE_URL}/reports/leads/`;
                    params.status = "followup";
                    break;
            }

            const response = await axios.get(endpoint, {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
            });

            let data = response.data;
            if (activeTab === "overview" && data.summary) {
                // Flattening the overview summary for the OverviewTab component
                data = {
                    total_leads: data.summary.total_leads,
                    unassigned: data.summary.unassigned,
                    total_actioned: data.summary.total_assigned,
                    new_assigned: data.summary.assigned,
                    second_attempt: data.summary.second_attempt,
                    third_attempt: data.summary.third_attempt,
                    completed: data.summary.completed,
                    followup: data.summary.followup,
                    deal_won: data.summary.deal_won,
                    deal_lost: data.summary.deal_lost,
                    invalid: data.summary.invalid,
                    dnd: data.summary.dnd,
                    prospect: data.summary.prospect,
                };
                setTotalCount(0);
            } else if (data.results) {
                // Handle paginated response
                setTotalCount(data.count || 0);

                if (["lead-reports", "prospect-wise", "followup-wise"].includes(activeTab)) {
                    data = { leads: data.results };
                } else if (activeTab === "agent-performance") {
                    data = { agents: data.results };
                } else if (activeTab === "asc-wise") {
                    data = { ascs: data.results };
                }
            } else if (activeTab === "disposition-wise") {
                setTotalCount(0); // Summary tab, no pagination needed
            }

            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch report data", error);
            // Mock data for demonstration
            // setReportData(generateMockReportData(activeTab));
        } finally {
            setLoading(false);
        }
    };

    // const generateMockReportData = (tabId) => {
    //     switch (tabId) {
    //         case "overview":
    //             return {
    //                 total_leads: 1000,
    //                 assigned: 2,
    //                 completed: 0,
    //                 deal_won: 0,
    //                 deal_lost: 0,
    //                 in_progress: 5,
    //             };
    //         case "lead-reports":
    //             return {
    //                 leads: [
    //                     {
    //                         lead_id: "#493",
    //                         email_contact: "{'type': 'office', 'email': 'jacqueline92@example.org'} | {'type': 'mobile', 'phone': '361.445.6229', 'status': 'followup', 'remarks': 'testing', 'connected': False, 'call_count': 2, 'followup_date': ''}",
    //                         lead_name: "Brian Miller",
    //                         lead_company: "Aguilar, Rodriguez and Monroe",
    //                         asc_details: "12345678 - Hopes",
    //                         status: "followup",
    //                         assigned_to_email: "moni@gmail.com"
    //                     },
    //                     {
    //                         lead_id: "#1000",
    //                         email_contact: "{'type': 'office', 'email': 'angelachapman@example.com'} | {'type': 'mobile', 'phone': '703-873-0299', 'connected': False}",
    //                         lead_name: "Douglas Morgan",
    //                         lead_company: "Smith LLC",
    //                         asc_details: "Unassigned",
    //                         status: "assigned"
    //                     },
    //                     {
    //                         lead_id: "#151",
    //                         email_contact: "{'type': 'office', 'email': 'mary09@example.org'} | {'type': 'mobile', 'phone': '(417)222-3329x4490', 'status': 'prospect', 'remarks': 'I have intrest but i will call you after some days', 'connected': False, 'call_count': 1, 'followup_date': ''}",
    //                         lead_name: "Gary Richardson",
    //                         lead_company: "Acevedo LLC",
    //                         asc_details: "Unassigned",
    //                         status: "prospect"
    //                     },
    //                     {
    //                         lead_id: "#741",
    //                         email_contact: "{'type': 'office', 'email': 'jeffreymacias@example.com'} | {'type': 'mobile', 'phone': '001-597-547-1092x086', 'status': 'voicemail', 'connected': False, 'call_count': 0, 'followup_date': ''}",
    //                         lead_name: "Sydney Jackson",
    //                         lead_company: "Alexander, Russell and Banks",
    //                         asc_details: "Unassigned",
    //                         status: "second-attempt"
    //                     },
    //                 ],
    //             };
    //         case "agent-performance":
    //             return {
    //                 agents: [
    //                     {
    //                         agent_id: 14,
    //                         agent_name: "Moni",
    //                         asc_code: "12345678",
    //                         asc_location: "Hopes",
    //                         assigned: 2,
    //                         completed: 0,
    //                         deal_won: 0,
    //                         conversion_rate: "0.0%",
    //                         performance_score: 1
    //                     }
    //                 ],
    //             };
    //         case "disposition-wise":
    //             return {
    //                 dispositions: [
    //                     { disposition: "Assigned", count: 2, percentage: "0.2%", color: "#FF9800", icon: "👤" },
    //                     { disposition: "Call Back", count: 1, percentage: "0.1%", color: "#FFC107", icon: "📞" },
    //                     { disposition: "Prospect", count: 1, percentage: "0.1%", color: "#2196F3", icon: "🌟" }
    //                 ],
    //             };
    //         case "asc-wise":
    //             return {
    //                 ascs: [
    //                     {
    //                         asc_code: "12345678",
    //                         asc_name: "Moni",
    //                         asc_location: "Hopes",
    //                         contact_person: "moni@gmail.com",
    //                         phone: "7878787878",
    //                         total_leads: 2,
    //                         completed: 0,
    //                         deal_won: 0,
    //                         deal_lost: 0,
    //                         conversion_rate: "0.0%",
    //                         performance_trend: "down"
    //                     }
    //                 ],
    //             };
    //         default:
    //             return {};
    //     }
    // };

    const handleExport = async () => {
        const queryParams = {
            type: activeTab,
            report_format: "csv"
        };
        
        if (ascCode?.length > 0) queryParams.asc_code = ascCode.map(item => item.value).join(',');
        if (ascName?.length > 0) queryParams.asc_name = ascName.map(item => item.value).join(',');
        if (ascLocation?.length > 0) queryParams.location = ascLocation.map(item => item.value).join(',');
        if (disposition?.length > 0) queryParams.disposition = disposition.map(item => item.value).join(',');
        if (activeTab === "prospect-wise") queryParams.status = "prospect";
        if (activeTab === "followup-wise") queryParams.status = "followup";
        if (startDate) queryParams.start_date = startDate;
        if (endDate) queryParams.end_date = endDate;

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
            const filename = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success(`Export successful`);
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Export failed. Please try again.");
        }
    };

    const handlePrint = async () => {
        const queryParams = {
            type: activeTab
        };
        
        if (ascCode?.length > 0) queryParams.asc_code = ascCode.map(item => item.value).join(',');
        if (ascName?.length > 0) queryParams.asc_name = ascName.map(item => item.value).join(',');
        if (ascLocation?.length > 0) queryParams.location = ascLocation.map(item => item.value).join(',');
        if (disposition?.length > 0) queryParams.disposition = disposition.map(item => item.value).join(',');
        if (activeTab === "prospect-wise") queryParams.status = "prospect";
        if (activeTab === "followup-wise") queryParams.status = "followup";
        if (startDate) queryParams.start_date = startDate;
        if (endDate) queryParams.end_date = endDate;

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

    const clearFilters = () => {
        setAscCode([]);
        setAscName([]);
        setAscLocation([]);
        setDisposition([]);
        setStartDate("");
        setEndDate("");
    };

    // const handleApplyFilters = () => {
    //     fetchReportData();
    // };

    // Custom styles for react-select to match the theme
    const customSelectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '42px',
            borderRadius: '8px',
            borderColor: 'var(--border-color, #ddd)',
            backgroundColor: 'var(--card-bg, #fff)',
            fontSize: '14px',
            '&:hover': {
                borderColor: 'var(--primary-dark, #7D2A1F)'
            }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--card-bg, #fff)',
            borderRadius: '8px',
            zIndex: 1000
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? 'var(--primary-dark, #7D2A1F)'
                : state.isFocused
                    ? 'var(--primary-light, #F5E7D3)'
                    : 'transparent',
            color: state.isSelected ? '#fff' : 'var(--text-primary, #333)',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: 'var(--primary-dark, #7D2A1F)'
            }
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: 'var(--primary-light, #F5E7D3)',
            borderRadius: '4px'
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: 'var(--primary-dark, #7D2A1F)',
            fontWeight: '500'
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: 'var(--primary-dark, #7D2A1F)',
            ':hover': {
                backgroundColor: 'var(--primary-dark, #7D2A1F)',
                color: 'white'
            }
        })
    };

    return (
        <div className="reports-tabbed">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <Sidebar />
            </aside>

            <main className="reports-main">
                <Navbar pageTitle="Reports" subTitle="System Analytics & Lead Statistics" />
                <header className="reports-header strip-container">
                    <div className="tabs-navigation">
                        <div className="tabs-group">
                            {visibleTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab !== "overview" && (
                            <div className="report-actions">
                                <button className="print-btn" onClick={handlePrint}>
                                    <FiPrinter /> Print
                                </button>
                                <button className="export-btn" onClick={handleExport}>
                                    <FiDownload /> Export
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Filters Section - User Management Style */}
                <section className="reports-filters-inline">
                    {["SUPERADMIN", "ADMIN", "SUPERVISOR"].includes(user_role) && (
                        <>
                            <Select
                                value={ascCode}
                                onChange={setAscCode}
                                options={ascCodeOptions.map(code => ({ value: code, label: code }))}
                                isMulti
                                placeholder="ASC Code"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={customSelectStyles}
                            />

                            <Select
                                value={ascName}
                                onChange={setAscName}
                                options={ascNameOptions.map(name => ({ value: name, label: name }))}
                                isMulti
                                placeholder="ASC Name"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={customSelectStyles}
                            />

                            <Select
                                value={ascLocation}
                                onChange={setAscLocation}
                                options={locationOptions.map(location => ({ value: location, label: location }))}
                                isMulti
                                placeholder="ASC Location"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={customSelectStyles}
                            />
                        </>
                    )}

                    {!["prospect-wise", "followup-wise"].includes(activeTab) && (
                        <Select
                            value={disposition}
                            onChange={setDisposition}
                            options={dispositionOptions.map(disp => ({ value: disp, label: disp }))}
                            isMulti
                            placeholder="Disposition"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={customSelectStyles}
                        />
                    )}

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="filter-date"
                        placeholder="Start Date"
                    />

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="filter-date"
                        placeholder="End Date"
                    />

                    <button className="clear-filter-btn" onClick={clearFilters}>
                        ✕
                    </button>
                </section>

                {/* Tab Content */}
                <section className="tab-content">
                    {loading ? (
                        <div className="loading-state">Loading report data...</div>
                    ) : (
                        <>
                            {activeTab === "overview" && <OverviewTab data={reportData} />}
                            {(activeTab === "lead-reports" || activeTab === "prospect-wise" || activeTab === "followup-wise") && <LeadReportsTab data={reportData} />}
                            {activeTab === "agent-performance" && <AgentPerformanceTab data={reportData} />}
                            {activeTab === "disposition-wise" && <DispositionWiseTab data={reportData} />}
                            {activeTab === "asc-wise" && <ASCWiseTab data={reportData} navigate={navigate} />}
                        </>
                    )}
                </section>

                {/* Pagination Controls */}
                {activeTab !== "overview" && activeTab !== "disposition-wise" && totalCount > PAGE_SIZE && (
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                            Previous
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {Math.ceil(totalCount / PAGE_SIZE)}
                        </span>
                        <button
                            className="page-btn"
                            disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Showing count */}
                {activeTab !== "overview" && totalCount > 0 && (
                    <div className="showing-count">
                        Showing {PAGE_SIZE * (currentPage - 1) + 1} to {Math.min(PAGE_SIZE * currentPage, totalCount)} of {totalCount} records
                    </div>
                )}
            </main>
        </div>
    );
}

// Tab Components
function OverviewTab({ data }) {
    if (!data) return null;

    return (
        <div className="overview-tab">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <FiLayers className="stat-icon" />
                        <h3>Total Leads</h3>
                    </div>
                    <p className="stat-value">{data.total_leads || 0}</p>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <FiUserPlus className="stat-icon" style={{ color: 'var(--primary-dark)' }} />
                        <h3>New Assigned</h3>
                    </div>
                    <p className="stat-value">{data.new_assigned || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiUserCheck className="stat-icon" />
                        <h3>Total Actioned</h3>
                    </div>
                    <p className="stat-value">{data.total_actioned || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiRepeat className="stat-icon" />
                        <h3>Second Attempt</h3>
                    </div>
                    <p className="stat-value">{data.second_attempt || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiRefreshCcw className="stat-icon" />
                        <h3>Third Attempt</h3>
                    </div>
                    <p className="stat-value">{data.third_attempt || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiCheckCircle className="stat-icon" />
                        <h3>Completed</h3>
                    </div>
                    <p className="stat-value">{data.completed || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiPhone className="stat-icon" />
                        <h3>Follow Up</h3>
                    </div>
                    <p className="stat-value">{data.followup || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiStar className="stat-icon" />
                        <h3>Prospect</h3>
                    </div>
                    <p className="stat-value">{data.prospect || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiAward className="stat-icon" style={{ color: 'var(--success-green)' }} />
                        <h3>Sale Won</h3>
                    </div>
                    <p className="stat-value success">{data.deal_won || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiAlertCircle className="stat-icon" style={{ color: 'var(--error-red)' }} />
                        <h3>Deal Lost</h3>
                    </div>
                    <p className="stat-value error">{data.deal_lost || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiAlertCircle className="stat-icon" style={{ color: 'var(--error-red)' }} />
                        <h3>Invalid</h3>
                    </div>
                    <p className="stat-value error">{data.invalid || 0}</p>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <FiMinusCircle className="stat-icon" />
                        <h3>DND</h3>
                    </div>
                    <p className="stat-value dnd">{data.dnd || 0}</p>
                </div>
            </div>
        </div>
    );
}

const formatContact = (contactStr) => {
    if (!contactStr) return "N/A";

    try {
        // The string comes in a Python dictionary-like format: "{'email': '...'}"
        // We'll extract email and phone using regex for better reliability
        const emailMatch = contactStr.match(/'email':\s*'([^']+)'/);
        const phoneMatch = contactStr.match(/'phone':\s*'([^']+)'/);

        const email = emailMatch ? emailMatch[1] : null;
        const phone = phoneMatch ? phoneMatch[1] : null;

        if (!email && !phone) return <div className="email-contact-scroll">{contactStr}</div>;

        return (
            <div className="contact-info">
                {email && <div className="email">{email}</div>}
                {phone && <div className="phone">{phone}</div>}
            </div>
        );
    } catch (e) {
        return <div className="email-contact-scroll">{contactStr}</div>;
    }
};

function LeadReportsTab({ data }) {
    if (!data?.leads) return <div className="no-data">No lead data available</div>;

    return (
        <div className="lead-reports-tab">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>LEAD ID</th>
                        <th>EMAIL & CONTACT</th>
                        <th>NAME</th>
                        <th>COMPANY</th>
                        <th>ASC DETAILS</th>
                        <th>STATUS</th>
                        <th>ASSIGNED TO</th>
                    </tr>
                </thead>
                <tbody>
                    {data.leads.map((lead, idx) => (
                        <tr key={idx}>
                            <td>{lead.lead_id}</td>
                            <td>
                                {formatContact(lead.email_contact)}
                            </td>
                            <td className="name-cell">{lead.lead_name}</td>
                            <td>{lead.lead_company}</td>
                            <td>{lead.asc_details}</td>
                            <td>
                                <span className={`status-badge status-${lead.status.toLowerCase().replace(/\s/g, '-')}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td>{lead.assigned_to_email || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AgentPerformanceTab({ data }) {
    if (!data?.agents) return <div className="no-data">No agent data available</div>;

    return (
        <div className="agent-performance-tab">
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
                    {data.agents.map((agent, idx) => (
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
    );
}

function DispositionWiseTab({ data }) {
    if (!data?.dispositions) return <div className="no-data">No disposition data available</div>;

    return (
        <div className="disposition-wise-tab">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Disposition</th>
                        <th>Count</th>
                        <th>Percentage</th>
                        <th>Visual</th>
                    </tr>
                </thead>
                <tbody>
                    {data.dispositions.map((disp, idx) => (
                        <tr key={idx}>
                            <td>{disp.disposition}</td>
                            <td>{disp.count}</td>
                            <td>{disp.percentage}</td>
                            <td>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: disp.percentage, background: "var(--primary-dark)" }}
                                    ></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ASCWiseTab({ data, navigate }) {
    if (!data?.ascs) return <div className="no-data">No ASC data available</div>;

    return (
        <div className="asc-wise-tab">
            <table className="report-table">
                <thead>
                    <tr>
                        <th>ASC Code</th>
                        <th>Location</th>
                        <th>Total Assigned</th>
                        <th>Followup</th>
                        <th>Sale Won</th>
                        <th>Deal Lost</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    {data.ascs.map((asc, idx) => (
                        <tr key={idx}>
                            <td>{asc.asc_code}</td>
                            <td>{asc.asc_location}</td>
                            <td>{asc.total_assigned}</td>
                            <td>{asc.followup}</td>
                            <td className="success">{asc.deal_won}</td>
                            <td className="error">{asc.deal_lost}</td>
                            <td>
                                <button
                                    className="action-btn view"
                                    onClick={() => navigate(`/reports/asc-performance?code=${asc.asc_code}&location=${asc.asc_location}`)}
                                    title="View Agents"
                                >
                                    <FiEye />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
