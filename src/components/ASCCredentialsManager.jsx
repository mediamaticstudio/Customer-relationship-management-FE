import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { FiX, FiMenu, FiTrash2, FiPlus, FiLock, FiUser, FiHash, FiClock, FiShield } from "react-icons/fi";
import { API_BASE_URL } from "../config.jsx";
import { toast } from "react-toastify";
import "../styles/ASCCredentialsManager.css";

const API_URL = `${API_BASE_URL}/auth/asc-credentials/`;

export default function ASCCredentialsManager() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Credential Form
  const [formData, setFormData] = useState({
    asc_code: "",
    username: "",
    password: ""
  });

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data?.status === "success") {
        setCredentials(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch credentials", error);
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(API_URL, formData);
      if (res.data.status === "success") {
        toast.success("New ASC Credential Assigned!");
        setShowAddForm(false);
        setFormData({ asc_code: "", username: "", password: "" });
        fetchCredentials();
      } else {
        toast.error(res.data.message || "Failed to create");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating credential");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this credential? This ASC will no longer be able to log in.")) return;
    try {
      const res = await axios.delete(`${API_URL}${id}/`);
      if (res.data.status === "success") {
        toast.success("Access Revoked Successfully");
        fetchCredentials();
      }
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <div className="dashboard">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar />
      </aside>

      <main className="main-panel">
        <Navbar pageTitle="ASC Credentials" subTitle="Secure login management for Authorized Service Centers" />
        
        <div className="asc-manager-container">
          <header className="asc-manager-header">
            <div>
              <h1>ASC Credentials Manager</h1>
              <p style={{ color: 'var(--text-muted-dark)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                Dedicated secure login management for Authorized Service Centers.
              </p>
            </div>
            <button className="add-user" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <><FiX /> Close Form</> : <><FiPlus /> Assign New ASC</>}
            </button>
          </header>

          {showAddForm && (
            <div className="add-credential-card">
              <form className="credential-form" onSubmit={handleCreate}>
                <div className="form-field">
                  <label><FiHash /> ASC Code</label>
                  <input
                    type="text"
                    placeholder="Example: 123456"
                    value={formData.asc_code}
                    onChange={(e) => setFormData({ ...formData, asc_code: e.target.value.trim() })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label><FiUser /> User ID</label>
                  <input
                    type="text"
                    placeholder="Login Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.trim() })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label><FiLock /> Password</label>
                  <input
                    type="password"
                    placeholder="Access Code"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value.trim() })}
                    required
                  />
                </div>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Optimizing..." : <><FiShield /> Save Access</>}
                </button>
              </form>
            </div>
          )}

          <div className="credentials-table-wrapper">
            <table className="credentials-table">
              <thead>
                <tr>
                  <th><FiHash size={14} style={{ marginRight: 6 }} /> ASC Code</th>
                  <th><FiUser size={14} style={{ marginRight: 6 }} /> Login ID</th>
                  <th><FiClock size={14} style={{ marginRight: 6 }} /> Created At</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && credentials.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Fetching Records...</td></tr>
                ) : credentials.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted-dark)' }}>
                      No specialized credentials found. Start by assigning access to your first ASC!
                    </td>
                  </tr>
                ) : (
                  credentials.map((cred) => (
                    <tr key={cred.id}>
                      <td><span className="asc-badge">{cred.asc_code}</span></td>
                      <td><strong>{cred.username}</strong></td>
                      <td style={{ color: 'var(--text-muted-dark)', fontSize: '0.85rem' }}>{cred.created_at}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button
                            className="delete-action-btn"
                            onClick={() => handleDelete(cred.id)}
                            title="Revoke Access"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
