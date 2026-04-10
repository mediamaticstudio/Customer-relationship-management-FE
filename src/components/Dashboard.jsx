import React, { useState, useEffect } from "react";
import {
    FiUsers,
    FiCheckCircle,
    FiXCircle,
    FiTrendingUp,
    FiPieChart,
    FiBarChart2,
    FiCalendar,
    FiRefreshCw,
    FiClock,
    FiX,
    FiUserCheck,
    FiBriefcase
} from "react-icons/fi";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/Dashboard.css";
import { API_BASE_URL } from "../config.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

const Dashboard = () => {
    // State Management
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [timePeriod, setTimePeriod] = useState("daily");

    const [bucketData, setBucketData] = useState({});
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState('trend'); // 'trend', 'graph', 'count'
    const navigate = useNavigate();

    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fetch Analytics Data
    const fetchAnalytics = async (isManual = false) => {
        setLoading(true);
        try {
            const startStr = formatDate(startDate);
            const endStr = formatDate(endDate);

            // Add cache busting timestamp for manual refresh
            const url = `${API_BASE_URL}/dashboard/details/?start_date=${startStr}&end_date=${endStr}&period=${timePeriod}${isManual ? `&t=${Date.now()}` : ""}`;

            const response = await fetch(
                url,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access")}`
                    }
                }
            );

            if (!response.ok) throw new Error("Failed to fetch analytics");

            const resData = await response.json();
            const rawData = resData.data;

            // Combine summary total with individual bucket counts
            const mappedBuckets = {
                total: rawData.summary.total_leads,
                lifetime: rawData.summary.total_leads_lifetime,
                activity: rawData.summary.total_activity,
                ...rawData.bucket_counts
            };

            setBucketData(mappedBuckets);
            setTrendData(rawData.trends || []);

            if (isManual) {
                toast.success("Dashboard data refreshed!");
            }
        } catch (error) {
            console.error("Analytics Error:", error);
            toast.error("Failed to refresh dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics(false);
    }, [startDate, endDate, timePeriod]);

    const handleRefresh = () => {
        const today = new Date();
        if (formatDate(startDate) === formatDate(today) && formatDate(endDate) === formatDate(today)) {
            // If already today, just trigger a manual re-fetch
            fetchAnalytics(true);
        } else {
            // Setting these will trigger the useEffect to fetch data
            setStartDate(today);
            setEndDate(today);
            // We show a slightly different message here
            toast.info("Dashboard reset to today");
        }
    };

    // Chart Data Preparation Helpers
    const lineChartData = {
        labels: trendData.map(d => d.date),
        datasets: [
            {
                label: 'Lead Trends',
                data: trendData.map(d => d.count),
                borderColor: '#4d191d',
                backgroundColor: 'rgba(77, 25, 29, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#4d191d',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0, // Straight lines as per image
                fill: false,
            },
        ],
    };

    const bucketConfig = [
        { key: 'assigned', label: 'Assigned', color: '#4d191d' },
        { key: 'second-attempt', label: 'Second Attempt', color: '#ff9f00' },
        { key: 'third-attempt', label: 'Third Attempt', color: '#ff5252' },
        { key: 'completed', label: 'Completed', color: '#00c091' },
        { key: 'followup', label: 'Follow Up', color: '#4081ff' },
        { key: 'prospect', label: 'Prospect', color: '#8b5cf6' },
        { key: 're-research', label: 'Re-Research', color: '#475569' },
        { key: 'deal-won', label: 'Deal Won', color: '#059669' },
        { key: 'sale-lost', label: 'Deal Lost', color: '#dc2626' },
        { key: 'dnd', label: 'DND', color: '#64748b' },
    ];

    return (
        <div className="analytics-dashboard">
            <aside className="sidebar-container">
                <Sidebar />
            </aside>

            <main className="analytics-main">
                <Navbar />

                {/* Brand Header Row (Title + Filters) */}
                <div className="dashboard-header-row">
                    <div className="dashboard-title-group">
                        <h1 className="dashboard-main-title">Dashboard Overview</h1>
                    </div>

                    <div className="dashboard-filters-container">
                        <div className="dashboard-controls">
                            {timePeriod === "daily" && (
                                <>
                                    <div className="control-group">
                                        <label className="control-label">FROM DATE</label>
                                        <div className="control-input-wrapper">
                                            <FiCalendar className="inner-icon" />
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                dateFormat="MM/dd/yyyy"
                                                className="compact-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="control-group">
                                        <label className="control-label">TO DATE</label>
                                        <div className="control-input-wrapper">
                                            <FiCalendar className="inner-icon" />
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                dateFormat="MM/dd/yyyy"
                                                className="compact-input"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="control-group">
                                <label className="control-label">TIME PERIOD</label>
                                <select
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value)}
                                    className="compact-select"
                                >
                                    <option value="daily">Daily View</option>
                                    <option value="weekly">Weekly View</option>
                                    <option value="yearly">Yearly View</option>
                                </select>
                            </div>

                            <button
                                className={`refresh-icon-btn ${loading ? 'spinning' : ''}`}
                                onClick={handleRefresh}
                                disabled={loading}
                                title="Refresh Data"
                            >
                                <FiRefreshCw />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards Grid */}
                <section className="summary-cards">
                    <div className="summary-card clickable" onClick={() => navigate('/import-history')} style={{ cursor: 'pointer' }}>
                        <div className="card-top-row">
                            <div className="card-title-group">
                                <div className="card-icon" style={{ background: '#fff5f5', color: '#ff4d4f' }}>
                                    <FiBriefcase />
                                </div>
                                <h3>TOTAL LEADS</h3>
                            </div>
                            <p className="card-value">{loading ? "..." : (bucketData.lifetime || 0)}</p>
                        </div>
                        <span className="card-subtitle">Lifetime leads (Click for details)</span>
                    </div>

                    <div className="summary-card">
                        <div className="card-top-row">
                            <div className="card-title-group">
                                <div className="card-icon" style={{ background: '#f0f5ff', color: '#2f54eb' }}>
                                    <FiUsers />
                                </div>
                                <h3>TOTAL ASSIGNED</h3>
                            </div>
                            <p className="card-value">{bucketData.assigned || 0}</p>
                        </div>
                        <span className="card-subtitle">In selected period</span>
                    </div>

                    <div className="summary-card">
                        <div className="card-top-row">
                            <div className="card-title-group">
                                <div className="card-icon" style={{ background: '#f6ffed', color: '#52c41a' }}>
                                    <FiCheckCircle />
                                </div>
                                <h3>DEAL WON</h3>
                            </div>
                            <p className="card-value">{bucketData["deal-won"] || 0}</p>
                        </div>
                        <span className="card-subtitle">Successful conversions</span>
                    </div>

                    <div className="summary-card">
                        <div className="card-top-row">
                            <div className="card-title-group">
                                <div className="card-icon" style={{ background: '#e6f7ff', color: '#1890ff' }}>
                                    <FiClock />
                                </div>
                                <h3>FOLLOW-UP</h3>
                            </div>
                            <p className="card-value">{bucketData["followup"] || 0}</p>
                        </div>
                        <span className="card-subtitle">Active leads</span>
                    </div>

                    {/* Additional cards match the look of reference */}
                    <div className="summary-card">
                        <div className="card-top-row">
                            <div className="card-title-group">
                                <div className="card-icon" style={{ background: '#f9f0ff', color: '#722ed1' }}>
                                    <FiUserCheck />
                                </div>
                                <h3>PROSPECT</h3>
                            </div>
                            <p className="card-value">{bucketData.prospect || 0}</p>
                        </div>
                        <span className="card-subtitle">Potential deals</span>
                    </div>

                    <div className="summary-card">
                        <div className="card-top-row">
                            <div className="card-title-group">
                                <div className="card-icon" style={{ background: '#fff1f0', color: '#f5222d' }}>
                                    <FiXCircle />
                                </div>
                                <h3>DEAL LOST</h3>
                            </div>
                            <p className="card-value">{bucketData["sale-lost"] || 0}</p>
                        </div>
                        <span className="card-subtitle">Lost sales</span>
                    </div>
                </section>

                {/* View Switcher */}
                <div className="view-switcher">
                    <button className={`view-btn ${activeView === 'trend' ? 'active' : ''}`} onClick={() => setActiveView('trend')}>
                        <FiTrendingUp /> Trends
                    </button>
                    <button className={`view-btn ${activeView === 'graph' ? 'active' : ''}`} onClick={() => setActiveView('graph')}>
                        <FiPieChart /> Graph
                    </button>
                    <button className={`view-btn ${activeView === 'count' ? 'active' : ''}`} onClick={() => setActiveView('count')}>
                        <FiBarChart2 /> Count
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="chart-area-container">
                    {activeView === 'trend' && (
                        <div className="chart-card full-width">
                            <div className="chart-header">
                                <h3>Lead Trends Over Time</h3>
                                <p className="chart-subtitle">Daily breakdown</p>
                            </div>
                            <div className="chart-container" style={{ height: '300px' }}>
                                <Line
                                    data={lineChartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                align: 'center',
                                                labels: {
                                                    boxWidth: 40,
                                                    boxHeight: 12,
                                                    padding: 20,
                                                    font: { size: 12, weight: '700' }
                                                }
                                            }
                                        },
                                        scales: {
                                            x: {
                                                grid: { display: false },
                                                ticks: {
                                                    maxRotation: 45,
                                                    minRotation: 45,
                                                    font: { size: 10, weight: '600' },
                                                    autoSkip: true,
                                                    maxTicksLimit: 15
                                                }
                                            },
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: '#f0f0f0' },
                                                ticks: {
                                                    font: { size: 10 },
                                                    callback: (value) => Math.round(value)
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}


                    {activeView === 'graph' && (
                        <div className="charts-grid-two">
                            <div className="chart-card half-width">
                                <div className="chart-header">
                                    <h3>Bucket Distribution</h3>
                                    <p className="chart-subtitle">Lead status breakdown</p>
                                </div>
                                <div className="chart-container" style={{ height: '300px' }}>
                                    <Pie
                                        data={{
                                            labels: bucketConfig.map(b => b.label),
                                            datasets: [{
                                                data: bucketConfig.map(b => bucketData[b.key] || 0),
                                                backgroundColor: bucketConfig.map(b => b.color),
                                                borderWidth: 0
                                            }]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'right',
                                                    labels: {
                                                        usePointStyle: true,
                                                        pointStyle: 'rect',
                                                        padding: 15,
                                                        font: {
                                                            size: 11,
                                                            weight: '700'
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="chart-card half-width">
                                <div className="chart-header">
                                    <h3>Bucket Comparison</h3>
                                    <p className="chart-subtitle">Leads per status</p>
                                </div>
                                <div className="chart-container" style={{ height: '300px' }}>
                                    <Bar
                                        data={{
                                            labels: bucketConfig.map(b => b.label),
                                            datasets: [{
                                                label: 'Leads Count',
                                                data: bucketConfig.map(b => bucketData[b.key] || 0),
                                                backgroundColor: bucketConfig.map(b => b.color),
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    position: 'top',
                                                    align: 'end',
                                                    labels: {
                                                        boxWidth: 40,
                                                        boxHeight: 12,
                                                        usePointStyle: false,
                                                        font: {
                                                            size: 11,
                                                            weight: '600'
                                                        }
                                                    }
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: { display: false },
                                                    ticks: {
                                                        font: { size: 10, weight: '600' },
                                                        maxRotation: 45,
                                                        minRotation: 45
                                                    }
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    grid: { color: '#f0f0f0' },
                                                    ticks: {
                                                        font: { size: 10 },
                                                        callback: (value) => Math.round(value)
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'count' && (
                        <div className="chart-card full-width">
                            <div className="chart-header">
                                <h3>Detailed Bucket Statistics</h3>
                                <p className="chart-subtitle">Lead status breakdown and conversion rates</p>
                            </div>
                            <div className="stats-table-wrapper">
                                <table className="stats-table">
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>Count</th>
                                            <th>Percentage</th>
                                            <th>Visual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bucketConfig.map((item) => {
                                            const count = bucketData[item.key] || 0;
                                            const total = bucketData.total || 1;
                                            const percentage = ((count / total) * 100).toFixed(0);
                                            return (
                                                <tr key={item.key}>
                                                    <td>{item.label}</td>
                                                    <td className="count-col">{count}</td>
                                                    <td>{percentage}%</td>
                                                    <td className="visual-col">
                                                        <div className="progress-bg">
                                                            <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Dashboard;

