import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ImportLeads from "./ImportLeads";
import ExportLeads from "./ExportLeads";
import AgentCSVUpdate from "./AgentCSVUpdate";
import "../styles/Settings.css";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import {
  FiX,
  FiMenu,
  FiUpload,
  FiDownload,
  FiUsers,
  FiChevronRight,
  FiUserPlus,
  FiRefreshCcw
} from "react-icons/fi";

export const Settings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar />
      </aside>

      <main className="main-panel">
        <Navbar pageTitle="Lead Configuration" subTitle="Configure lead imports and data mapping" />

        <div className="settings-container-premium">
          {/* Lead Import Card */}
          <article className="glass-card import-card-premium">
            <header className="premium-card-header">
              <div className="premium-icon-box import-accent">
                <FiUpload size={28} />
              </div>
              <div className="header-text">
                {/* <div className="card-status-pill-inline">Configuration</div> */}
                <h3>Lead Import</h3>
                <p>Bulk upload lead records via CSV or Excel</p>
              </div>
            </header>

            <div className="premium-card-content">
              <ImportLeads />
            </div>

            <footer className="premium-card-footer">
              <div className="footer-meta">
                <span>Supports: .csv, .xlsx</span>
                <span className="dot"></span>
                <span>Max 10MB</span>
              </div>
            </footer>
          </article>

          {/* Data Export Card */}
          <article className="glass-card export-card-premium">
            <header className="premium-card-header">
              <div className="premium-icon-box export-accent">
                <FiDownload size={28} />
              </div>
              <div className="header-text">
                {/* <div className="card-status-pill-inline">Services</div> */}
                <h3>Data Export</h3>
                <p>Download lead data with custom filters</p>
              </div>
            </header>

            <div className="premium-card-content">
              <ExportLeads />
            </div>

            <footer className="premium-card-footer">
              <div className="footer-meta">
                <span>Format: CSV, Excel, JSON</span>
              </div>
            </footer>
          </article>

          {/* Agent CSV Update Card */}
          <article className="glass-card agent-card-premium">
            <header className="premium-card-header">
              <div className="premium-icon-box agent-accent">
                <FiRefreshCcw size={28} />
              </div>
              <div className="header-text">
                {/* <div className="card-status-pill-inline">Operations</div> */}
                <h3>Agent Update</h3>
                <p>Sync agent call logs and dispositions</p>
              </div>
            </header>

            <div className="premium-card-content">
              <AgentCSVUpdate />
            </div>

            <footer className="premium-card-footer">
              <div className="footer-meta">
                <span>CSV format only</span>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
};