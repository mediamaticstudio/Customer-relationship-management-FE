import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AddUser.css";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../config.jsx";
import Dashboard from "../components/Dashboard.jsx";

const API = `${API_BASE_URL}/configurations/users/`;
const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "AGENT", label: "Agent" },
  { value: "CLIENT", label: "Client" },
];


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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // "edit" | "delete"
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const dashboard = false;


  const [count, setCount] = useState(0);
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
    // Redirect if not authorized (MediaMatic Studio or ASC Management - assuming Admin covers both for now)
    // If strict matrix: Supervisor (2) and Agent (3) cannot create users.
    if (!IS_ADMINS) {
      toast.error("Unauthorized access: Only Admins can create users.");
      navigate("/dashboard");
      return;
    }


    fetchUsers(1);
  }, [navigate, LOGGED_IN_ROLE]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SUBMIT FORM =================
  const submitForm = async () => {
    try {
      // ================= ROLE FLAGS =================
      const IS_SUPERADMIN = LOGGED_IN_ROLE === "SUPERADMIN";
      const IS_ADMIN = LOGGED_IN_ROLE === "ADMIN";

      // ================= BASIC VALIDATION =================
      if (!form.asc_name || !form.email || !form.role) {
        toast.error("Name, Email and Role are required");
        return;
      }

      // ================= PASSWORD VALIDATION =================
      if (!editId) {
        // Create user
        if (!form.password || !form.confirmPassword) {
          toast.error("Password and Confirm Password are required");
          return;
        }

        if (form.password !== form.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      } else {
        // Edit user
        if (form.password) {
          if (!form.confirmPassword) {
            toast.error("Please confirm your password");
            return;
          }

          if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
          }
        }
      }

      // ================= ROLE PERMISSION CHECK =================
      if (IS_ADMIN && ["SUPERADMIN", "ADMIN"].includes(form.role)) {
        toast.error("Admins cannot create or edit this role");
        return;
      }

      // ================= BUILD PAYLOAD =================
      const payload = {
        asc_name: form.asc_name,
        email: form.email,
        phone_no: form.phone_no,
        role: form.role,
        asc_code: IS_SUPERADMIN ? form.asc_code : LOGGED_IN_ASC_CODE,
        asc_location: IS_SUPERADMIN ? form.asc_location : LOGGED_IN_ASC_LOCATION,
        created_by: LOGGED_IN_USER_ID,
      };

      // ================= PASSWORD PAYLOAD =================
      if (form.password) {
        payload.password = form.password;
      }

      // ================= API CALL =================
      let res;

      if (editId) {
        res = await axios.put(`${API}${editId}/`, payload);
        toast.success(res.data?.message || "User updated successfully");
      } else {
        res = await axios.post(API, payload);
        toast.success(res.data?.message || "User created successfully");
      }

      // ================= RESET FORM =================
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



  // ================= EDIT USER =================
  const editUser = (user) => {
    // ADMIN cannot edit SUPERADMIN / ADMIN
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

  const openConfirmModal = (type, user) => {
    setActionType(type);
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmOpen(false);
    setActionType(null);
    setSelectedUser(null);
  };

  // ================= DELETE USER =================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`${API}${id}/`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Delete failed", error);
    }
  };

  const handleConfirmAction = () => {
    if (actionType === "edit") {
      editUser(selectedUser);
    }

    if (actionType === "delete") {
      deleteUser(selectedUser.id);
    }

    closeConfirmModal();
  };
  const handleSubmitClick = () => {
    // Ask only when editing
    if (editId) {
      setShowSubmitConfirm(true);
    } else {
      submitForm(); // create user → no confirmation
    }
  };


  // ================= JSX =================
  return (
    <div className="add-user-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="add-user-card">
        <h2>Login Users</h2>

        <div className="user-form">
          <input
            name="asc_name"
            placeholder="Name"
            value={form.asc_name}
            onChange={handleChange}
            required
          />

          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input
            name="phone_no"
            placeholder="Phone"
            value={form.phone_no}
            onChange={handleChange}
            required
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
          />

          <input
            name="asc_code"
            placeholder="ASC Code"
            value={form.asc_code}
            onChange={handleChange}
            disabled={!IS_SUPERADMIN}
          />

          <input
            name="asc_location"
            placeholder="ASC Location"
            value={form.asc_location}
            onChange={handleChange}
            disabled={!IS_SUPERADMIN}
          />


          <input
            name="password"
            type="password"
            placeholder={editId ? "Leave blank to keep password" : "Password"}
            value={form.password}
            onChange={handleChange}
            required={!editId}
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder={editId ? "Leave blank to keep password" : "Confirm Password"}
            value={form.confirmPassword}
            onChange={handleChange}
            required={!editId}
          />


          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>

            {IS_SUPERADMIN && (
              <>
                <option value="ADMIN">Admin</option>
              </>
            )}

            {(IS_SUPERADMIN || IS_ADMIN) && (
              <>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="AGENT">Agent</option>
              </>
            )}
          </select>


          <button onClick={handleSubmitClick}>
            {editId ? "Update User" : "Create User"}
          </button>
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone No</th>
              <th>Email</th>
              <th>Role</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{u.asc_name}</td>
                  <td data-label="Phone No">{u.phone_no}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role">{u.role?.name || u.role}</td>
                  <td data-label="Edit">
                    <button
                      className="action-btn edit"
                      onClick={() => editUser(u)}
                    >
                      <FiEdit />
                    </button>

                  </td>
                  <td data-label="Delete">
                    <button
                      className="action-btn delete"
                      onClick={() => openConfirmModal("delete", u)}
                    >
                      <FiTrash2 />
                    </button>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {count > 5 && <div className="pagination">
          <button
            disabled={!prevPage}
            onClick={() => fetchUsers(currentPage - 1)}
          >
            ⬅ Previous
          </button>

          <span>Page {currentPage}</span>

          <button
            disabled={!nextPage}
            onClick={() => fetchUsers(currentPage + 1)}
          >
            Next ➡
          </button>
        </div>}

      </div>
      {isConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>
              {actionType === "edit" ? "Confirm Edit" : "Confirm Delete"}
            </h3>

            <p>
              {actionType === "edit"
                ? `Do you want to edit ${selectedUser?.asc_name}?`
                : `Are you sure you want to delete ${selectedUser?.asc_name}? This action cannot be undone.`}
            </p>

            <div className="modal-actions">
              <button onClick={closeConfirmModal}>Cancel</button>

              <button
                className={actionType === "delete" ? "danger" : "primary"}
                onClick={handleConfirmAction}
              >
                {actionType === "edit" ? "Yes, Edit" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ------------ */}
      {showSubmitConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Update</h3>

            <p>
              Do you want to update this user?
            </p>

            <div className="modal-actions">
              <button onClick={() => setShowSubmitConfirm(false)}>
                Cancel
              </button>

              <button
                className="primary"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  submitForm();
                }}
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
