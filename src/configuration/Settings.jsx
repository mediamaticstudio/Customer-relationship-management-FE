import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ImportLeads from "./ImportLeads";
import ExportLeads from "./ExportLeads";
import AgentCSVUpdate from "./AgentCSVUpdate";
import "../styles/Settings.css";
import {
  FiUser,
  FiArrowLeft,
  FiUpload,
  FiDownload,
  FiUsers,
  FiChevronRight,
  FiUserPlus
} from "react-icons/fi";

export const Settings = () => {
  const navigate = useNavigate();


  return (
    <div className="settings-wrapper">
      {/* Header Section */}
      <header className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft className="back-icon" />
          <span>Back</span>
        </button>
      </header>

      {/* Settings Cards Grid */}
      <div className="settings-container">
        {/* Import Leads Card */}
        <div className="settings-card import-card">
          <div className="card-header">
            {/* <div className="card-icon-wrapper import-icon">
              
              <FiUpload size={24} />
            </div> */}
            <div className="card-icon-wrapper import-icon">
              <FiUpload size={24} />
            </div>

            <div>
              <h3 className="card-title">Lead Import</h3>
              <p className="card-description">Bulk upload lead records via CSV or Excel spreadsheets</p>
            </div>
          </div>
          <div className="card-body">
            <ImportLeads />
          </div>
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
              <h3 className="card-title">Data Export</h3>
              <p className="card-description">Download lead data with custom filters and formatting</p>
            </div>
          </div>
          <div className="card-body">
            <ExportLeads />
          </div>
          <div className="card-footer">
            <span className="format-hint">Exports as: CSV, Excel, JSON</span>
          </div>
        </div>

        {/* Add Lead Card */}
        <div className="settings-card add-lead-card" onClick={() => navigate("/create")}>
          <div className="card-header">
            <div className="card-icon-wrapper add-lead-icon">
              <FiUserPlus size={24} />
            </div>
            <div>
              <h3 className="card-title">Manual Creation</h3>
              <p className="card-description">Directly input a single lead record into the system</p>
            </div>
            <FiChevronRight className="chevron-icon" size={20} />
          </div>

          <div className="card-illustration">
            <div className="illustration-circle">
              <FiUserPlus size={48} />
            </div>
          </div>

          <div className="card-footer">
            <span className="user-count">Create Manual Entry</span>
          </div>
        </div>
        {/* Agent CSV Update Card */}
        <div className="settings-card import-card">
          <div className="card-header">
            <div className="card-icon-wrapper import-icon">
              <FiUpload size={24} />
            </div>

            <div>
              <h3 className="card-title">Agent CSV Update</h3>
              <p className="card-description">Upload agent call updates (disposition, remarks, follow-up)</p>
            </div>
          </div>
          <div className="card-body">
            <AgentCSVUpdate />
          </div>
          <div className="card-footer">
            <span className="format-hint">CSV only. Agent selection required.</span>
          </div>
        </div>

        {/* User Management Card */}
        <div className="settings-card user-card" onClick={() => navigate("/adduser")}>
          <div className="card-header">
            <div className="card-icon-wrapper user-icon">
              <FiUsers size={24} />
            </div>
            <div>
              <h3 className="card-title">Team Access</h3>
              <p className="card-description">Control user accounts, roles, and system permissions</p>
            </div>
            <FiChevronRight className="chevron-icon" size={20} />
          </div>

          <div className="card-illustration">
            <div className="illustration-circle">
              <FiUsers size={48} />
            </div>
          </div>

          <div className="card-footer">
            <span className="user-count">Security & Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
};