import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AddUser.css";
import { useNavigate } from "react-router-dom";
import { 
  FiEdit, 
  FiTrash2, 
  FiUserPlus, 
  FiFilter, 
  FiDownload,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../config.jsx";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API = `${API_BASE_URL}/configurations/users/`;

export default function AddUser() {
  const LOGGED_IN_ROLE = (localStorage.getItem("role") || "").toUpperCase();
  const LOGGED_IN_ASC_CODE = localStorage.getItem("asc_code");
  const LOGGED_IN_ASC_LOCATION = localStorage.getItem("asc_location");
  const LOGGED_IN_USER_ID = localStorage.getItem("user_id");

  const IS_SUPERADMIN = LOGGED_IN_ROLE === "SUPERADMIN";
  const IS_ADMIN = LOGGED_IN_ROLE === "ADMIN";
  const IS_ADMINS = ["SUPERADMIN", "ADMIN"].includes(LOGGED_IN_ROLE);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [count, setCount] = useState(0);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // "edit" | "delete"
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    asc_name: "",
    email: "",
    phone_no: "",
    password: "",
    confirmPassword: "",
    role: "",
    asc_code: LOGGED_IN_ASC_CODE || "",
    asc_location: LOGGED_IN_ASC_LOCATION || "",
  });

  // ================= FETCH USERS =================
  const fetchUsers = async (page = 1) => {
    try {
      const res = await axios.get(`${API}?page=${page}&page_size=5&logged_in_role=${LOGGED_IN_ROLE}`);
      setUsers(res.data.data || []);
      setCount(res.data.count);
      setCurrentPage(res.data.current_page);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    if (!IS_ADMINS) {
      toast.error("Unauthorized access: Only Admins can create users.");
      navigate("/dashboard");
      return;
    }
    fetchUsers(1);
  }, [navigate, LOGGED_IN_ROLE]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    try {
      if (!form.asc_name || !form.email || !form.role) {
        toast.error("Name, Email and Role are required");
        return;
      }

      if (!editId) {
        if (!form.password || !form.confirmPassword) {
          toast.error("Password and Confirm Password are required");
          return;
        }
        if (form.password !== form.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      } else {
        if (form.password && form.password !== form.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      }

      if (IS_ADMIN && ["SUPERADMIN", "ADMIN"].includes(form.role)) {
        toast.error("Admins cannot create or edit this role");
        return;
      }

      const payload = {
        asc_name: form.asc_name,
        email: form.email,
        phone_no: form.phone_no,
        role: form.role,
        asc_code: IS_SUPERADMIN ? form.asc_code : LOGGED_IN_ASC_CODE,
        asc_location: IS_SUPERADMIN ? form.asc_location : LOGGED_IN_ASC_LOCATION,
        created_by: LOGGED_IN_USER_ID,
      };

      if (form.password) {
        payload.password = form.password;
      }

      let res;
      if (editId) {
        res = await axios.put(`${API}${editId}/`, payload);
        toast.success(res.data?.message || "User updated successfully");
      } else {
        res = await axios.post(API, payload);
        toast.success(res.data?.message || "User created successfully");
      }

      setForm({
        asc_name: "",
        email: "",
        phone_no: "",
        password: "",
        confirmPassword: "",
        role: "",
        asc_code: LOGGED_IN_ASC_CODE || "",
        asc_location: LOGGED_IN_ASC_LOCATION || "",
      });

      setEditId(null);
      fetchUsers(currentPage);

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  const editUser = (user) => {
    if (IS_ADMIN && ["SUPERADMIN", "ADMIN"].includes(user.role)) {
      toast.error("You are not allowed to edit this user");
      return;
    }

    setEditId(user.id);
    setForm({
      asc_name: user.asc_name || "",
      email: user.email || "",
      phone_no: user.phone_no || "",
      password: "",
      confirmPassword: "",
      role: user.role || "",
      asc_code: user.asc_code || LOGGED_IN_ASC_CODE,
      asc_location: user.asc_location || LOGGED_IN_ASC_LOCATION,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API}${id}/`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const openConfirmModal = (type, user) => {
    setActionType(type);
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (actionType === "delete") {
      deleteUser(selectedUser.id);
    }
    setIsConfirmOpen(false);
  };

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const getBadgeClass = (role) => {
    role = role?.toUpperCase() || "";
    if (role === "ADMIN" || role === "SUPERADMIN") return "badge-admin";
    if (role === "SUPERVISOR") return "badge-manager";
    if (role === "AGENT") return "badge-employee";
    return "badge-employee";
  };

  return (
    <div className="analytics-dashboard">
      <aside className="sidebar-container">
        <Sidebar />
      </aside>

      <main className="analytics-main">
        <Navbar />
        
        <div className="add-user-page">
          {/* Page Title */}
          <header className="page-title-section">
            <h1>Add Users</h1>
            {/* <p>Register new administrative or team members to the HRMS portal.</p> */}
          </header>

          {/* Form Card */}
          <section className="form-card">
            <div className="form-grid">
              <div className="form-field">
                <label>Full Name</label>
                <input name="asc_name" placeholder="John Doe" value={form.asc_name} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Email Address</label>
                <input name="email" placeholder="john.doe@company.com" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Phone Number</label>
                <input name="phone_no" placeholder="+91 98765 43210" value={form.phone_no} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Employee ID</label>
                <input name="asc_code" placeholder="EMP-2024-001" value={form.asc_code} onChange={handleChange} disabled={!IS_SUPERADMIN} />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input name="asc_location" placeholder="e.g. Trichy" value={form.asc_location} onChange={handleChange} disabled={!IS_SUPERADMIN} />
              </div>
              <div className="form-field">
                <label>User Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="">Select Role</option>
                  {IS_SUPERADMIN && <option value="ADMIN">Admin</option>}
                  {(IS_SUPERADMIN || IS_ADMIN) && (
                    <>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="AGENT">Agent</option>
                    </>
                  )}
                </select>
              </div>
              <div className="form-field">
                <label>Password</label>
                <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Confirm Password</label>
                <input name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} />
              </div>
            </div>
            <div className="create-btn-container">
              <button className="create-user-btn" onClick={submitForm}>
                <FiUserPlus /> {editId ? "Update User" : "Create User"}
              </button>
            </div>
          </section>

          {/* User Directory Card */}
          <section className="directory-card">
            <div className="directory-header">
              <h2>User Directory</h2>
              <div className="directory-actions">
                <button className="icon-button"><FiFilter /></button>
                <button className="icon-button"><FiDownload /></button>
              </div>
            </div>

            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone No</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-circle" style={{ backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}22`, color: '#5D2E32' }}>
                            {getInitials(u.asc_name || "U")}
                          </div>
                          <span className="user-name-text">{u.asc_name}</span>
                        </div>
                      </td>
                      <td><span className="user-phone-cell">{u.phone_no}</span></td>
                      <td><span className="user-email-cell">{u.email}</span></td>
                      <td>
                        <span className={`role-badge ${getBadgeClass(u.role?.name || u.role)}`}>
                          {u.role?.name || u.role}
                        </span>
                      </td>
                      <td>
                        <div className="action-icons">
                          <FiEdit className="action-icon" onClick={() => editUser(u)} title="Edit" />
                          <FiTrash2 className="action-icon" onClick={() => openConfirmModal("delete", u)} title="Delete" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: '#888' }}>
                      No users found in directory
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {count > 5 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {(currentPage - 1) * 5 + 1}-{Math.min(currentPage * 5, count)} of {count} users
                </div>
                <div className="pagination-controls">
                  <button disabled={!prevPage} onClick={() => fetchUsers(currentPage - 1)} className="page-nav-btn"><FiChevronLeft /></button>
                  <span className={`page-num active`}>{currentPage}</span>
                  {nextPage && <span className="page-num" onClick={() => fetchUsers(currentPage + 1)}>{currentPage + 1}</span>}
                  <button disabled={!nextPage} onClick={() => fetchUsers(currentPage + 1)} className="page-nav-btn"><FiChevronRight /></button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      {isConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{selectedUser?.asc_name}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setIsConfirmOpen(false)}>Cancel</button>
              <button className="danger" onClick={handleConfirmAction}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
