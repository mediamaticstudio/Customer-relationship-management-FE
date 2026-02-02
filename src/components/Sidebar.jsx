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
  FiMoon
} from "react-icons/fi";
import Logo from '../assets/logo.png';
import LogoContent from "../assets/name.png";
import { NavLink } from "react-router-dom";
import '../styles/Sidebar.css';
import { API_BASE_URL } from "../config.jsx";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";




export const Sidebar = ({ selectedStatus, onStatusChange }) => {
  const user_role = localStorage.getItem("role")?.toUpperCase();
  const [openLeads, setOpenLeads] = useState(false);
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
      await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: "POST",
      });
      localStorage.clear();
      toast.success("Logged out successfully");
      navigate("/"); // go back to login
    } catch {
      toast.error("Logout failed");
    }
  };
  const leadItems = [
    { label: "Unassigned", value: "unassigned", icon: <FiUserMinus /> },
    { label: "Assigned", value: "assigned", icon: <FiClipboard /> },
    { label: "Second Call Attempt", value: "second-attempt", icon: <FiPhoneCall /> },
    { label: "Third Call Attempt", value: "third-attempt", icon: <FiRepeat /> },
    { label: "Completed", value: "completed", icon: <FiCheckCircle /> },
    { label: "Follow Up", value: "followup", icon: <FiClock /> },
    { label: "Prospect", value: "prospect", icon: <FiUserPlus /> },
    { label: "Deal Won", value: "deal-won", icon: <FiTrendingUp /> },
    { label: "Deal Lost", value: "deal-lost", icon: <FiTrendingDown /> },
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
      <div className="logo-sidebar"><img src={Logo} alt="Logo" />
        <img src={LogoContent} alt='Content' className='logo-content' /></div>

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
              onClick={() => setOpenLeads(!openLeads)}
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


        {/* Settings - only ADMIN and SUPERVISOR */}
        {user_role === "ADMIN" || user_role === "SUPERADMIN" &&
          <>
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
            </NavLink></>}
      </nav>


      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon /> : <FiSun />}
          <span>{theme === "light" ? "Dark" : "Light"}</span>
        </button>

        <button className="logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  )
}
