import React, { useState, useEffect } from "react";
import { FiLogOut, FiMoon, FiSun, FiBell, FiHelpCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config.jsx";
import "../styles/Navbar.css";

export const Navbar = ({ pageTitle, subTitle }) => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const userName = localStorage.getItem("userName") || "User";
    const userRole = localStorage.getItem("role") || "Staff";

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout/`, {
                method: "POST",
                headers: {
                    "X-DB-Name": localStorage.getItem("selected_db") || "default",
                },
            });

            const theme = localStorage.getItem("theme");
            const selectedDb = localStorage.getItem("selected_db");
            localStorage.clear();
            if (theme) localStorage.setItem("theme", theme);
            if (selectedDb) localStorage.setItem("selected_db", selectedDb);

            toast.success("Logged out successfully");
            navigate("/");
        } catch {
            toast.error("Logout failed");
        }
    };

    const getInitials = (name) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <nav className="top-navbar">
            <div className="navbar-left">
                {/* Empty left side to push actions to the right or center as per image */}
            </div>

            <div className="navbar-right">
                <div className="user-info-section">
                    <div className="user-text">
                        <span className="welcome-text">Welcome, {userName.toLowerCase()}</span>
                        <span className="role-text">{userRole.toUpperCase()}</span>
                    </div>
                    <div className="user-avatar" title={userName}>
                        {getInitials(userName)}
                    </div>
                </div>

                <div className="navbar-actions-container">
                    <div className="navbar-actions">
                        <button className="nav-action-btn theme-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === "light" ? <FiMoon /> : <FiSun />}
                        </button>
                        <button className="nav-action-btn logout-btn" onClick={handleLogout} title="Logout">
                            <FiLogOut />
                        </button>
                    </div>
                    <div className="version-label">CRM v2.1.0</div>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
