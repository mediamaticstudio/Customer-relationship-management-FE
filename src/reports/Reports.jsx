import { useNavigate } from "react-router-dom";
import { FiFileText, FiTrendingUp, FiPieChart, FiBarChart2, FiArrowLeft } from "react-icons/fi";
import "../styles/Reports.css";

export const Reports = () => {
  const navigate = useNavigate();

  const reportCategories = [
    {
      title: "Lead Reports",
      description: "Analyze lead conversion, connectivity, and agent productivity.",
      icon: <FiTrendingUp size={48} />,
      path: "/leadreports",
      color: "rgba(122, 37, 48, 0.1)"
    },
    {
      title: "Call Analytics",
      description: "Detailed breakdown of call volumes and connect rates.",
      icon: <FiBarChart2 size={48} />,
      path: "#",
      comingSoon: true
    },
    {
      title: "Performance Summaries",
      description: "Weekly and monthly performance overviews by branch.",
      icon: <FiPieChart size={48} />,
      path: "#",
      comingSoon: true
    }
  ];

  return (
    <div className="reports-wrapper">
      <div className="reports-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        {/* <h2 className="reports-title">Analytics & Reports</h2> */}

      </div>

      <div className="settings-container" style={{ marginTop: "20px" }}>
        {reportCategories.map((cat, index) => (
          <div
            key={index}
            className={`settings-card ${cat.comingSoon ? 'disabled' : ''}`}
            onClick={() => !cat.comingSoon && navigate(cat.path)}
          >
            <div className="card-header">
              <div
                className="card-icon-wrapper"
                style={{ background: cat.color || "rgba(0,0,0,0.05)", color: "var(--primary-dark)" }}
              >
                {cat.icon}
              </div>
              <h3 className="card-title">{cat.title}</h3>
              <p className="card-description">{cat.description}</p>
            </div>
            {cat.comingSoon && (
              <div className="card-footer" style={{ borderTop: "none" }}>
                <span className="format-hint">Coming Soon</span>
              </div>
            )}
            {!cat.comingSoon && (
              <button className="settings-btn" style={{ marginTop: "auto" }}>
                Open Reports
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
