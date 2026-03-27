import React from 'react'
import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiPhoneCall,
  FiRepeat,
  FiCheckCircle,
  FiClock,
  FiUserPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiSlash,
  FiClipboard,
  FiLogOut,
  FiUserMinus,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiSun,
  FiMoon,
  FiSearch,
  FiLock,
  FiBriefcase
} from "react-icons/fi";
import Logo from '../assets/download.png';
import LogoContent from "../assets/name.png";
import { NavLink, Link } from "react-router-dom";
import '../styles/Sidebar.css';
import { API_BASE_URL } from "../config.jsx";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";




export const Sidebar = ({ selectedStatus, onStatusChange }) => {
  const user_role = localStorage.getItem("role")?.toUpperCase();
  const [openLeads, setOpenLeads] = useState(() => {
    const saved = localStorage.getItem("sidebar_leads_open");
    if (saved !== null) return saved === "true";
    // Check if current path is lead-related
    return window.location.pathname.startsWith("/assigned") || window.location.pathname.startsWith("/leads");
  });

  const toggleLeads = () => {
    setOpenLeads((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar_leads_open", newState);
      return newState;
    });
  };
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const navigate = useNavigate();

  const handleStatusSelect = (status) => {
    if (onStatusChange) {
      onStatusChange(status);
    } else {
      navigate(`/assigned?status=${status}`);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };



  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        headers: {
          "X-DB-Name": localStorage.getItem("selected_db") || "default",
        },
      });

      // Keep theme and selected_db, clear everything else
      const theme = localStorage.getItem("theme");
      const selectedDb = localStorage.getItem("selected_db");
      localStorage.clear();
      if (theme) localStorage.setItem("theme", theme);
      if (selectedDb) localStorage.setItem("selected_db", selectedDb);

      toast.success("Logged out successfully");
      navigate("/"); // go back to login
    } catch {
      toast.error("Logout failed");
    }
  };
  const leadItems = [
    { label: "Unassigned", value: "unassigned", icon: <FiUserMinus /> },
    { label: "Assigned", value: "assigned", icon: <FiClipboard /> },
    { label: "Second Attempt", value: "second-attempt", icon: <FiPhoneCall /> },
    { label: "Third Attempt", value: "third-attempt", icon: <FiRepeat /> },
    { label: "Completed", value: "completed", icon: <FiCheckCircle /> },
    { label: "Follow Up", value: "followup", icon: <FiClock /> },
    { label: "Prospect", value: "prospect", icon: <FiUserPlus /> },
    { label: "Re-Research", value: "re-research", icon: <FiSearch /> },
    { label: "Sale Won", value: "deal-won", icon: <FiTrendingUp /> },
    { label: "Sale Lost", value: "sale-lost", icon: <FiTrendingDown /> },
    { label: "Invalid", value: "invalid", icon: <FiTrendingDown /> },
    { label: "DND", value: "dnd", icon: <FiSlash /> },
  ];

  // Filter lead items based on role
  const filteredLeadItems = leadItems.filter((item) => {
    // AGENT should not see "Unassigned"
    if (user_role === "AGENT" && item.value === "unassigned") return false;
    return true;
  });
  return (
    <div>
      <Link
        to={user_role === "AGENT" || user_role === "SUPERVISOR" ? "/assigned" : "/dashboard"}
        className="logo-sidebar"
      >
        <img src={Logo} alt="Logo" />
        <img src={LogoContent} alt='Content' className='logo-content' />
      </Link>

      <div className="sidebar-nav-container">

      <nav className="sidebar-nav">
        {user_role !== "AGENT" && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `dropdown-item ${isActive ? "active" : ""}`
            }
          >
            <FiHome />
            <span>Dashboard</span>
          </NavLink>
        )}



        {/* Leads Dropdown */}
        <div className="dropdown">
          <>
            <button
              className="dropdown-toggle"
              onClick={toggleLeads}
            >
              <FiUsers />
              <span>Leads</span>
              {openLeads ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {openLeads && (
              <div className="dropdown-menu">
                {filteredLeadItems.map((item) => (
                  <button
                    key={item.value}
                    className={`dropdown-item ${selectedStatus === item.value ? "active" : ""}`}
                    onClick={() => handleStatusSelect(item.value)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        </div>

        <NavLink to="/client-portal" className={({ isActive }) =>
          `dropdown-item ${isActive ? "active" : ""}`
        }>
          <FiBriefcase />
          <span>Client Portal</span>
        </NavLink>

        {/* Settings - only ADMIN and SUPERVISOR */}
        {(user_role === "ADMIN" || user_role === "SUPERADMIN") &&
          <>
            <NavLink to="/user" className={({ isActive }) =>
              `dropdown-item ${isActive ? "active" : ""}`
            }>
              <FiSettings />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) =>
              `dropdown-item ${isActive ? "active" : ""}`
            }>
              <FiFileText />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) =>
              `dropdown-item ${isActive ? "active" : ""}`
            }>
              <FiSettings />
              <span>Settings</span>
            </NavLink>
            <NavLink to="/asc-credentials" className={({ isActive }) =>
              `dropdown-item ${isActive ? "active" : ""}`
            }>
              <FiLock />
              <span>ASC Credentials</span>
            </NavLink>
          </>}
      </nav>
      </div>


      <div className="sidebar-footer">
      </div>
    </div>
  )
}
export default Sidebar;
