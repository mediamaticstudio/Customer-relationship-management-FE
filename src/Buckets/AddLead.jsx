import { useState } from "react";
import axios from "axios";
import "../styles/AddLead.css";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { 
    FiX, 
    FiMenu, 
    FiUserPlus, 
    FiMail, 
    FiPhone, 
    FiGlobe, 
    FiChevronRight 
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";


export default function AddLead() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    lead_name: "",
    lead_company: "",
    lead_emails: "",
    lead_phones: "",
    lead_website: "",
    lead_designation: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    status: "assigned",
    remarks: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      lead_emails: form.lead_emails
        ? form.lead_emails.split(",").map((e) => ({
          type: "office",
          email: e.trim(),
        }))
        : [],
      lead_phones: form.lead_phones
        ? form.lead_phones.split(",").map((p) => ({
          type: "mobile",
          phone: p.trim(),
          status: "assigned",
          remarks: "Initial creation",
          call_count: 0
        }))
        : [],
      lead_address: {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
      },
      lead_website: form.lead_website,
      lead_designation: form.lead_designation,
      status: form.status,
      remarks: form.remarks,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/crm/leads/create/`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.status === "Fail" || res.data.status === "error") {
        toast.error(res.data.message || "Error creating lead");
        return;
      }

      toast.success(res.data.message || "Lead created successfully");
      setForm({
        lead_name: "",
        lead_company: "",
        lead_website: "",
        lead_designation: "",
        lead_emails: "",
        lead_phones: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        status: "assigned",
        remarks: "",
      });
      navigate("/assigned?status=assigned");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error creating lead";
      toast.error(errorMsg);
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
        <Navbar />
        
        <div className="add-lead-page">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            LEADS MANAGEMENT <FiChevronRight /> <span>CREATE NEW ENTITY</span>
          </div>

          <div className="lead-form-card">
            <form onSubmit={handleSubmit}>
              {/* SECTION: Lead Information */}
              <div className="form-section">
                <div className="section-header-group">
                  <h2 className="section-main-title">Lead Information</h2>
                  <p className="section-subtitle">Fill in the primary contact and company details for the new prospect.</p>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>LEAD NAME</label>
                    <input
                      name="lead_name"
                      placeholder="e.g. Alexander Pierce"
                      value={form.lead_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>DESIGNATION / ROLE</label>
                    <input
                      name="lead_designation"
                      placeholder="e.g. Chief Technology Officer"
                      value={form.lead_designation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>COMPANY</label>
                    <input
                      name="lead_company"
                      placeholder="e.g. Acme Corporation"
                      value={form.lead_company}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field icon-field">
                    <label>WEBSITE</label>
                    <div className="input-with-icon">
                      <FiGlobe className="field-icon" />
                      <input
                        name="lead_website"
                        placeholder="www.acme.com"
                        value={form.lead_website}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-field icon-field">
                    <label>EMAILS</label>
                    <div className="input-with-icon">
                      <FiMail className="field-icon" />
                      <input
                        name="lead_emails"
                        placeholder="alex@acme.com, contact@acme.com"
                        value={form.lead_emails}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-field icon-field">
                    <label>PHONES</label>
                    <div className="input-with-icon">
                      <FiPhone className="field-icon" />
                      <input
                        name="lead_phones"
                        placeholder="+1 (555) 000-0000"
                        value={form.lead_phones}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Location Details */}
              <div className="form-section">
                <h3 className="section-secondary-title">LOCATION DETAILS</h3>
                
                <div className="form-grid-3">
                  <div className="form-field span-2">
                    <label>STREET / AREA</label>
                    <input
                      name="street"
                      placeholder="123 Business Avenue, Suite 500"
                      value={form.street}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>PINCODE</label>
                    <input
                      name="pincode"
                      placeholder="10001"
                      value={form.pincode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>CITY</label>
                    <input
                      name="city"
                      placeholder="New York"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>STATE</label>
                    <input
                      name="state"
                      placeholder="New York"
                      value={form.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>COUNTRY</label>
                    <input
                      name="country"
                      placeholder="United States"
                      value={form.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Remarks */}
              <div className="form-section">
                <h3 className="section-secondary-title no-accent">REMARKS / INTERNAL NOTES</h3>
                <div className="form-field full-width">
                  <textarea
                    name="remarks"
                    placeholder="Enter any additional context or background information about this lead..."
                    value={form.remarks}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="submit-btn"><FiUserPlus /> Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
