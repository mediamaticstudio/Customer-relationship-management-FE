import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ImportLeads from "./ImportLeads";
import ExportLeads from "./ExportLeads";
import "../styles/Settings.css";
import {
  FiUser,
  FiArrowLeft,
  FiUpload,
  FiDownload,
  FiUsers,
  FiChevronRight
} from "react-icons/fi";

export const Settings = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);


  return (
    <div className="settings-wrapper">
      {/* Header Section */}
      <header className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft className="back-icon" />
          <span>Back</span>
        </button>
        {/* <div className="header-content">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your leads and team members</p>
        </div> */}
      </header>

      {/* Settings Cards Grid */}
      <div className="settings-container">
        {/* Import Leads Card */}
        <div className="settings-card import-card">
          <div className="card-header">
            {/* <div className="card-icon-wrapper import-icon">
              
              <FiUpload size={24} />
            </div> */}
            <label className="card-icon-wrapper import-icon">
              <FiUpload size={24} />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                hidden
              />
            </label>

            <div>
              <h3 className="card-title">Import Leads</h3>
              <p className="card-description">Upload leads using CSV or Excel files</p>
            </div>
          </div>
          <ImportLeads file={file} setFile={setFile} />
          <div className="card-footer">
            <span className="format-hint">Supports: .csv, .xlsx (Max 10MB)</span>
          </div>
        </div>

        {/* Export Leads Card */}
        <div className="settings-card export-card">
          <div className="card-header">
            <div className="card-icon-wrapper export-icon">
              <FiDownload size={24} />
            </div>
            <div>
              <h3 className="card-title">Export Leads</h3>
              <p className="card-description">Download all leads with custom filters</p>
            </div>
          </div>
          <ExportLeads />
          <div className="card-footer">
            <span className="format-hint">Exports as: CSV, Excel, JSON</span>
          </div>
        </div>

        {/* User Management Card */}
        <div className="settings-card user-card" onClick={() => navigate("/adduser")}>
          <div className="card-header">
            <div className="card-icon-wrapper user-icon">
              <FiUsers size={24} />
            </div>
            <div>
              <h3 className="card-title">User Management</h3>
              <p className="card-description">Add and manage team members</p>
            </div>
            <FiChevronRight className="chevron-icon" size={20} />
          </div>

          <div className="user-card-content">
            <FiUser size={80} className="user-illustration" />
            <p className="user-card-text">Click to add new users or manage existing team members</p>
          </div>

          <div className="card-footer">
            <span className="user-count">Manage roles and permissions</span>
          </div>
        </div>
      </div>
    </div>
  );
};